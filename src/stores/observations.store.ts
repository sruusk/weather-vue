import { defineStore } from 'pinia';
import type { ForecastLocation, ObservationStation } from '@/types';
import { getObservationsForClosestStations } from "@/weather";

interface State {
    weatherStations: ObservationStation[];
    loading: boolean;
}

export const useObservationsStore = defineStore('observations', {
    state: (): State => {
        return {
            weatherStations: [],
            loading: false,
        }
    },

    actions: {
        changeLocation(location: ForecastLocation) {
            this.loading = true;
            getObservationsForClosestStations(location.lat, location.lon, 4)
                .then((stations) => {
                    console.log("Observation stations", stations);
                    this.weatherStations = stations;
                })
                .catch((error) => {
                    console.error(error);
                })
                .finally(() => {
                    this.loading = false;
                });
        }
    },

    getters: {
        stations: state => state.weatherStations,
        isLoading: state => state.loading,
    }
});
