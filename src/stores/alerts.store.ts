// @ts-ignore
import pointInPolygon from 'robust-point-in-polygon';
import {defineStore} from 'pinia';
import AlertsForLocationWorker from "@/workers/alertsForLocation?worker";
import type {FmiAlertData, FmiAlerts, ForecastLocation, Warnings} from "@/types";
import {getAlerts, getFloodingAlerts} from "@/warnings";

const severityOrder = ["Minor", "Moderate", "Severe", "Extreme"];

interface State {
    alerts: FmiAlerts;
    loading: boolean;
    alertLocationQueue: ForecastLocation[];
    alertsForLocation: {
        [key: string]: Warnings;
    }
}

export const useAlertsStore = defineStore('alerts', {
    state: (): State => {
        return {
            alerts: {
                fi: [],
                sv: [],
                en: []
            },
            loading: true,
            alertLocationQueue: [],
            alertsForLocation: {}
        }
    },

    actions: {
        init() {
            this.loading = true;
            Promise.all([
                getAlerts(),
                getFloodingAlerts()
            ]).then(([alerts, floodingAlerts]) => {
                console.log("FMI Alerts", alerts, "SYKE Flooding Alerts", floodingAlerts);
                // @ts-ignore
                Object.keys(alerts).forEach((key) => this.alerts[key].push(...alerts[key]));
                // @ts-ignore
                Object.keys(floodingAlerts).forEach((key) => this.alerts[key].push(...floodingAlerts[key]));
                this.loading = false;
                // Parse queued locations
                this.alertLocationQueue.forEach((location) => {
                    this.parseAlertsForLocation(location);
                });
            });
        },
        async parseAlertsForLocation(location: ForecastLocation) {
            // Don't parse if already parsed
            if (this.alertsForLocation[`${location.lat},${location.lon}`]) return;

            if (this.loading) {
                // Queue the location to be parsed when loading is complete
                this.alertLocationQueue.push(location);
                return;
            }

            let alerts: FmiAlertData[] = [];

            // Use web worker if available
            if (window.Worker) {
                await new Promise<void>((resolve) => {
                    const worker = new AlertsForLocationWorker();
                    worker.onmessage = (event) => {
                        // Need to convert dates from string to Date
                        alerts = event.data.map((alert: FmiAlertData) => {
                            alert.onset = new Date(alert.onset);
                            alert.expires = new Date(alert.expires);
                            return alert;
                        });
                        resolve();
                    };
                    worker.postMessage({
                        // Prevent Vue from converting to reactive object by cloning the data
                        // Web workers can't handle reactive objects
                        alerts: JSON.parse(JSON.stringify(this.alerts.en)),
                        location: JSON.parse(JSON.stringify(location))
                    });
                });
            } else {
                alerts = this.alerts.en.map(alert => {
                    if (alert.expires < new Date()) return undefined; // Expired
                    if (alert.polygons.find((polygon: any) => pointInPolygon(polygon, [location.lat, location.lon]) <= 0)) {
                        return alert;
                    }
                    return undefined;
                }).filter(alert => alert !== undefined) as FmiAlertData[];
            }

            const warnings: any = {};
            for (let i = 0; i < 5; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dayStart = new Date(date.setHours(0, 0, 0, 0));
                const dayEnd = new Date(date.setHours(23, 59, 59, 999));
                // Find all alerts active on this day
                const dayAlerts = alerts.filter(alert => alert.onset <= dayEnd && alert.expires >= dayStart);
                // Find the most severe alert
                let mostSevere: FmiAlertData | undefined = undefined;
                for (const alert of dayAlerts) {
                    if (!mostSevere || severityOrder.indexOf(alert.severity) > severityOrder.indexOf(mostSevere.severity)) {
                        mostSevere = alert;
                    }
                }
                if (mostSevere) {
                    warnings[i] = {
                        severity: mostSevere.severity,
                    }
                }
            }
            console.log(`Alerts for ${location.name}, ${location.region}`, warnings);
            this.alertsForLocation[`${location.lat},${location.lon}`] = warnings;
        },
    },

    getters: {
        getAlertsForLocation: (state: State) => (location: ForecastLocation): Warnings => {
            if (!state.alertsForLocation[`${location.lat},${location.lon}`]) {
                return {} as Warnings;
            }
            return state.alertsForLocation[`${location.lat},${location.lon}`];
        },
        getActiveAlertsForLocation: (state: State) => (location: ForecastLocation): FmiAlerts => {
            const out = {} as FmiAlerts;
            Object.keys(state.alerts).forEach((key) => {
                out[key as keyof FmiAlerts] = state.alerts[key as keyof FmiAlerts].filter((alert) => {
                    return alert.expires >= new Date()
                        && alert.onset <= new Date()
                        && alert.polygons.find((polygon: any) => pointInPolygon(polygon, [location.lat, location.lon]) <= 0);
                });
            });
            console.log(`Active alerts for ${location.name}, ${location.region}`, out);
            return out;
        }
    }
});
