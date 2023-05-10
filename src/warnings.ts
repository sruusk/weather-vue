// @ts-ignore
import pointInPolygon from 'point-in-polygon';
import type {ForecastLocation, Warning} from "@/types";
import 'fast-xml-parser';
import {XMLParser} from "fast-xml-parser";
const parser = new XMLParser({
    attributeNamePrefix: '@_',
    ignoreAttributes: false,
    parseAttributeValue: true
});


export function getAlertsForLocation(location: ForecastLocation) {
    return new Promise(resolve => {
        getAlerts().then(alerts => {
            // @ts-ignore
            const alertsForLocation = alerts.filter(alert => {
                for(let polygon in alert.polygons) {
                    if(pointInPolygon([location.lon, location.lat], polygon)) return true;
                }
                return false;
            });
            const alertsForDays = [] as Warning[];
            for(let i = 0; i < 5; i++) { // Find most severe alert for each day
                const date = new Date();
                date.setDate(date.getDate() + i); // Get date for day
                // @ts-ignore
                const alertsForDay = alertsForLocation.filter(alert => {
                    const alertDate = new Date(alert.expires);
                    return alertDate.getDate() === date.getDate();
                });
                if(alertsForDay.length > 0) {
                    const mostSevereAlert = alertsForDay.reduce((prev: string, current: string) => {
                        // @ts-ignore
                        if(SEVERITY[current.severity] > SEVERITY[prev.severity]) return current;
                        else return prev;
                    });
                    console.log(mostSevereAlert);
                    alertsForDays.push(mostSevereAlert[0]);
                }
            }
            resolve(alertsForDays);
        });
    }) as Promise<Warning[]>;
}

const SEVERITY = {
    "Severe" : 3,
    "Moderate": 2
}

function getAlerts() {
    const url = `https://alerts.fmi.fi/cap/feed/atom_fi-FI.xml`
    return new Promise((resolve, reject) => {
       fetch(url).then(response => {
           if(response.ok) return response.text();
           else reject(response);
       }).then(text => {
           const xml = parser.parse(text);
           const alerts = xml["entry"].map((entry: any) => {
               if(entry["content"]["alert"]["msgType"] === "Cancel") return undefined;
               const alert = entry["content"]["alert"]["info"][0];
               console.log(alert);
               return {
                   severity: alert["severity"],
                   polygons: alert["area"]["polygon"],
                   expires: alert["expires"]
               }
           });
           resolve(alerts);
       });
    });
}
