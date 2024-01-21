// @ts-ignore
import pointInPolygon from 'robust-point-in-polygon';
import type {FmiAlertData, ForecastLocation} from "@/types";

// Returns alerts for location
self.onmessage = (event) => {
    console.log("Alerts worker received message", event.data);
    const alerts = event.data.alerts as FmiAlertData[];
    const location = event.data.location as ForecastLocation;

    const out: FmiAlertData[] = alerts.map((alert: FmiAlertData) => {
        if (alert.expires < new Date()) return undefined; // Expired
        if (alert.polygons.find((polygon: any) => pointInPolygon(polygon, [location.lat, location.lon]) <= 0)) {
            return alert;
        }
        return undefined;
    }).filter(alert => alert !== undefined) as FmiAlertData[];

    self.postMessage(out);
}
