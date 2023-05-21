import {useSettingsStore} from "@/stores";
import 'fast-xml-parser';
import {XMLParser} from "fast-xml-parser";
import type {FmiAlerts} from "@/types";

const parser = new XMLParser({
    attributeNamePrefix: '@_',
    ignoreAttributes: false,
    parseAttributeValue: true
});

// This is not needed since FMI returns all languages in the same feed anyway
const alertUrl = () => {
    const lang = useSettingsStore().language;
    switch(lang) {
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
    const url = `https://corsproxy.io/?${ encodeURIComponent("https://alerts.fmi.fi/cap/feed/atom_fi-FI.xml") }`
    return new Promise((resolve, reject) => {
       fetch(url).then(response => {
           if(response.ok) return response.text();
           else reject(response);
       }).then(text => {
           const xml = parser.parse(text);
           const alerts = Object.fromEntries(
               Object.keys(languageMap).map((key: string) => {
                   return [languageMap[key], xml["feed"]["entry"].map((entry: any) => {
                       if(entry["content"]["alert"]["msgType"] === "Cancel") return undefined;
                       const alert = entry["content"]["alert"]["info"].find((alert: any) => alert["language"] === key);
                       if(!alert) return undefined;
                       if(!Array.isArray(alert["area"])) alert["area"] = [alert["area"]];
                       return {
                           severity: alert["severity"],
                           polygons: alert["area"].map((area: any) => area["polygon"].toString().split(" ").map((point: string) => {
                               const [lon, lat] = point.split(",");
                               return [parseFloat(lon), parseFloat(lat)];
                           }) as [number, number]),
                           onset: new Date(alert["onset"]),
                           expires: new Date(alert["expires"]),
                           event: alert["event"],
                           headline: alert["headline"],
                           description: alert["description"],
                       }
                   })];
               }));

           resolve(alerts);
       });
    });
}
