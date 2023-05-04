import { defineStore } from 'pinia';
import Weather  from '@/weather';
import Settings from "@/settings";
import type { Weather as WeatherType, ForecastLocation } from '@/types';

const defaultLocation: ForecastLocation = {
    name: "Kaivopuisto",
    identifier: "843554",
    region: "Helsinki",
    country: "Finland",
    lat: 60.15928,
    lon: 24.96119
};

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
                    this.changeLocation(defaultLocation);
                });
            } else {
                this.locatingComplete = true;
                console.log("Geolocation is not supported by this browser.");
                this.changeLocation(defaultLocation);
            }
        },
        async setGpsLocation(lat: number, lon: number) {
            if(!lat || !lon) return;
            const location = await Weather.getWeatherByLatLon(lat, lon);
            this.currentWeather = location;
            this.locationWeather = location;
        },
        async changeLocation(location: ForecastLocation) {
            if(!location) return;
            this.currentWeather = await Weather.getWeatherByLatLon(location.lat, location.lon);
        }
    },

    getters: {
        currentLocation: (state: State) => state.currentWeather?.location as ForecastLocation,
        hasWeather: (state: State) => state.currentWeather !== undefined,
        gpsWeather: (state: State) => state.locationWeather as WeatherType,
        gpsLocation: (state: State) => state.locationWeather?.location as ForecastLocation,
        locatingFailed: (state: State) => state.locatingComplete && !state.locationWeather,
    }
});
