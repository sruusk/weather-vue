// @ts-ignore
import pointInPolygon from 'robust-point-in-polygon';
import { defineStore } from 'pinia';
import type {ForecastLocation, Warnings, FmiAlert} from "@/types";
import { getAlerts } from "@/warnings";

const severityOrder = ["Minor", "Moderate", "Severe", "Extreme"];

interface State {
    alerts: FmiAlert[];
    loading: boolean;
}

export const useAlertsStore = defineStore('alerts', {
    state: (): State => {
        return {
            alerts: [],
            loading: true
        }
    },

    actions: {
        init() {
            this.loading = true;
            getAlerts().then(alerts => {
                console.log("FMI Alerts loaded", alerts);
                this.alerts = alerts;
                this.loading = false;
            });
        }
    },

    getters: {
        getAlertsForLocation: (state: State) => (location: ForecastLocation): Warnings => {
            const alerts: FmiAlert[] = state.alerts.map(alert => {
                if(alert.expires < new Date()) return undefined; // Expired
                if(alert.polygons.find((polygon: any) => pointInPolygon(polygon, [location.lat, location.lon]) <= 0)) {
                    return alert;
                }
                return undefined;
            }).filter(alert => alert !== undefined) as FmiAlert[];
            const warnings: any = {};
            for(let i = 0; i < 5; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dayStart = new Date(date.setHours(0, 0, 0, 0));
                const dayEnd = new Date(date.setHours(23, 59, 59, 999));
                // Find all alerts active on this day
                const dayAlerts = alerts.filter(alert => alert.onset <= dayEnd && alert.expires >= dayStart);
                // Find the most severe alert
                let mostSevere: FmiAlert | undefined = undefined;
                for(const alert of dayAlerts) {
                    if(!mostSevere || severityOrder.indexOf(alert.severity) > severityOrder.indexOf(mostSevere.severity)) {
                        mostSevere = alert;
                    }
                }
                if(mostSevere) {
                    warnings[i] = {
                        severity: mostSevere.severity,
                    }
                }
            }
            console.log("FMI Alerts", warnings);
            return warnings as Warnings;
        },
    }
});
