import {useSettingsStore} from "@/stores";
import 'fast-xml-parser';
import {XMLParser} from "fast-xml-parser";
import type {FmiAlert} from "@/types";

const parser = new XMLParser({
    attributeNamePrefix: '@_',
    ignoreAttributes: false,
    parseAttributeValue: true
});

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

export function getAlerts(): Promise<FmiAlert[]> {
    const url = `https://corsproxy.io/?${ encodeURIComponent(alertUrl()) }`
    return new Promise((resolve, reject) => {
       fetch(url).then(response => {
           if(response.ok) return response.text();
           else reject(response);
       }).then(text => {
           const xml = parser.parse(text);
           const alerts = xml["feed"]["entry"].map((entry: any) => {
               if(entry["content"]["alert"]["msgType"] === "Cancel") return undefined;
               const alert = entry["content"]["alert"]["info"][0];
               return {
                   severity: alert["severity"],
                   polygons: alert["area"].map((area: any) => area["polygon"].toString().split(" ").map((point: string) => {
                          const [lon, lat] = point.split(",");
                            return [parseFloat(lon), parseFloat(lat)];
                          }) as [number, number]),
                   onset: new Date(alert["onset"]),
                   expires: new Date(alert["expires"]),
               }
           });
           resolve(alerts);
       });
    });
}
