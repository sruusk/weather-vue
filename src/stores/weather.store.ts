import { defineStore } from 'pinia';
import Weather  from '@/weather';
import Settings from "@/settings";
import type { Weather as WeatherType, ForecastLocation } from '@/types';

interface State {
    currentWeather: WeatherType | undefined;
    locatingComplete: boolean;
    locationWeather: WeatherType | undefined;
}

export const useWeatherStore = defineStore('weather', {
    state: (): State => {
        return {
            currentWeather: undefined as WeatherType | undefined,
            locatingComplete: false,
            locationWeather: undefined as WeatherType | undefined,
        }
    },

    actions: {
        init() {
            if(this.locatingComplete) return;
            if(!Settings.location) this.locatingComplete = true;
            else if (navigator.geolocation) {
                console.log("Getting location...");
                navigator.geolocation.getCurrentPosition((position) => {
                    this.setGpsLocation(position.coords.latitude, position.coords.longitude).then(() => {
                        this.locatingComplete = true;
                    });
                }, (error) => {
                    this.locatingComplete = true;
                    console.log("Error getting location:", error);
                });
            } else {
                this.locatingComplete = true;
                console.log("Geolocation is not supported by this browser.");
            }
        },
        async setGpsLocation(lat: number, lon: number) {
            const location = await Weather.getWeatherByLatLon(lat, lon);
            this.currentWeather = location;
            this.locationWeather = location;
        },
        async changeLocation(location: ForecastLocation) {
            this.currentWeather = await Weather.getWeatherByLatLon(location.lat, location.lon);
        }
    },

    getters: {
        currentLocation: (state: State) => state.currentWeather?.location as ForecastLocation,
        hasWeather: (state: State) => state.currentWeather !== undefined,
        gpsWeather: (state: State) => state.locationWeather as WeatherType,
        gpsLocation: (state: State) => state.locationWeather?.location as ForecastLocation,
    }
});
