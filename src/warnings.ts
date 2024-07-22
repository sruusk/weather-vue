import {useSettingsStore} from "@/stores";
import 'fast-xml-parser';
import {XMLParser} from "fast-xml-parser";
import type {FmiAlerts} from "@/types";
import MetOClient from "@fmidev/metoclient";

const parser = new XMLParser();

// This is not needed since FMI returns all languages in the same feed anyway
// noinspection JSUnusedLocalSymbols
const alertUrl = () => {
    const lang = useSettingsStore().language;
    switch (lang) {
        case "fi":
            return "https://alerts.fmi.fi/cap/feed/atom_fi-FI.xml";
        case "sv":
            return "https://alerts.fmi.fi/cap/feed/atom_sv-FI.xml";
        default:
            return "https://alerts.fmi.fi/cap/feed/atom_en-GB.xml";
    }
}

const languageMap: any = {
    "fi-FI": "fi",
    "sv-FI": "sv",
    "en-GB": "en"
};

export function getAlerts(): Promise<FmiAlerts> {
    const url = ` https://a32.fi/proxy/proxy?apiKey=c2cf681ee102a815d7d8800a6aaa1de96998e66cb17bbcc8beb2a2d0268fd918&method=GET&url=${encodeURIComponent("https://alerts.fmi.fi/cap/feed/atom_fi-FI.xml")}`
    return new Promise((resolve, reject) => {
        fetch(url).then(response => {
            if (response.ok) return response.text();
            else reject(response);
        }).then(text => {
            const xml = parser.parse(text);
          	if(!Array.isArray(xml["feed"]["entry"])) xml["feed"]["entry"] = [ xml["feed"]["entry"] ];
            const alerts = Object.fromEntries(
                Object.keys(languageMap).map((key: string) => {
                    return [languageMap[key], xml["feed"]["entry"].map((entry: any) => {
                        if (!entry) return undefined;
                        if (entry["content"]["alert"]["msgType"] === "Cancel") return undefined;
                        const alert = entry["content"]["alert"]["info"].find((alert: any) => alert["language"] === key);
                        if (!alert) return undefined;
                        if (!Array.isArray(alert["area"])) alert["area"] = [alert["area"]];
                        return {
                            severity: alert["severity"],
                            polygons: alert["area"].map((area: any) => area["polygon"].toString().split(" ").map((point: string) => {
                                const [lat, lon] = point.split(",");
                                return [parseFloat(lat), parseFloat(lon)];
                            }) as [number, number]),
                            onset: new Date(alert["onset"]),
                            expires: new Date(alert["expires"]),
                            event: alert["event"],
                            headline: alert["headline"],
                            description: alert["description"],
                        }
                    }).filter((alert: any) => alert !== undefined) as any[]]
                }));

            resolve(alerts);
        });
    });
}

export function getFloodingAlerts(): Promise<FmiAlerts> {
    const url = 'https://wwwi2.ymparisto.fi/i2/vespa/alerts.json';
    return new Promise((resolve, reject) => {
        fetch(url).then(response => {
            if (response.ok) return response.json();
            else reject(response);
        }).then(json => {
            const alerts = Object.fromEntries(
                Object.keys(languageMap).map((key: string) => {
                    return [languageMap[key], json.features.map((alert: any) => {
                        return {
                            severity: alert.properties.severity,
                            polygons: alert.geometry.coordinates.map((polygon: any) => polygon.map((point: any) => {
                                const [lon, lat] = MetOClient.transform([point[0], point[1]], 'EPSG:3067', 'EPSG:4326');
                                return [lat, lon];
                            })),
                            onset: new Date(alert.properties.onset),
                            expires: new Date(alert.properties.expires),
                            event: alert.properties[`type_${languageMap[key]}`],
                            headline: alert.properties[`desc_${languageMap[key]}`],
                            description: alert.properties[`desc_${languageMap[key]}`],
                        }
                    })]
                }));
            resolve(alerts);
        });
    });
}
