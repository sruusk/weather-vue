import {defineStore} from 'pinia';
import type {ForecastLocation, ObservationStation} from '@/types';
import {getObservationsForClosestStations} from "@/weather";
import ObservationsWorker from "@/workers/observations?worker";

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
            (new Promise<void>((resolve) => {
                if (window.Worker) {
                    const worker = new ObservationsWorker();
                    worker.onmessage = (event) => {
                        this.weatherStations = event.data as ObservationStation[];
                        resolve();
                    }
                    worker.postMessage({lat: location.lat, lon: location.lon});
                } else {
                    getObservationsForClosestStations(location.lat, location.lon, 4)
                        .then((stations) => {
                            //console.log("Observation stations", stations);
                            this.weatherStations = stations;
                        })
                        .catch((error) => {
                            console.error(error);
                        })
                        .finally(() => {
                            resolve();
                        });
                }
            })).then(() => {
                this.loading = false;
            });
        }
    },

    getters: {
        stations: state => state.weatherStations,
        isLoading: state => state.loading,
    }
});
