// @ts-ignore
import pointInPolygon from 'robust-point-in-polygon';
import { defineStore } from 'pinia';
import {useSettingsStore} from "@/stores/settings.store";
import type {ForecastLocation, Warnings, FmiAlerts, FmiAlertData} from "@/types";
import { getAlerts, getFloodingAlerts } from "@/warnings";

const severityOrder = ["Minor", "Moderate", "Severe", "Extreme"];

interface State {
    alerts: FmiAlerts;
    loading: boolean;
}

export const useAlertsStore = defineStore('alerts', {
    state: (): State => {
        return {
            alerts: {
                fi: [],
                sv: [],
                en: []
            },
            loading: true
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
            });
        }
    },

    getters: {
        getAlertsForLocation: (state: State) => (location: ForecastLocation): Warnings => {
            let language = useSettingsStore().language;
            if(language !== "fi" && language !== "sv") language = "en";
            const alerts: FmiAlertData[] = state.alerts[language as keyof FmiAlerts].map(alert => {
                if (alert.expires < new Date()) return undefined; // Expired
                if (alert.polygons.find((polygon: any) => pointInPolygon(polygon, [location.lat, location.lon]) <= 0)) {
                    return alert;
                }
                return undefined;
            }).filter(alert => alert !== undefined) as FmiAlertData[];
            //console.log(`Alerts for ${location.name}, ${location.region}`, alerts);
            const warnings: any = {};
            for(let i = 0; i < 5; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dayStart = new Date(date.setHours(0, 0, 0, 0));
                const dayEnd = new Date(date.setHours(23, 59, 59, 999));
                // Find all alerts active on this day
                const dayAlerts = alerts.filter(alert => alert.onset <= dayEnd && alert.expires >= dayStart);
                // Find the most severe alert
                let mostSevere: FmiAlertData | undefined = undefined;
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
            console.log(`Alerts for ${location.name}, ${location.region}`, warnings);
            return warnings as Warnings;
        },
    }
});
