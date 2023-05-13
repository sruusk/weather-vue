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
    status: string;
    locatingComplete: boolean;
    locationWeather: WeatherType | undefined;
}

export const useWeatherStore = defineStore('weather', {
    state: (): State => {
        return {
            currentWeather: undefined as WeatherType | undefined,
            status: "",
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
                this.status = "home.locating"
                navigator.geolocation.getCurrentPosition((position) => {
                    this.status = "home.loadingForecast";
                    this.setGpsLocation(position.coords.latitude, position.coords.longitude).then(() => {
                        this.locatingComplete = true;
                        this.status = "";
                    });
                }, (error) => {
                    this.status = "home.loadingForecast";
                    this.locatingComplete = true;
                    console.log("Error getting location:", error);
                    this.changeLocation(defaultLocation).then(() => {
                        this.status = "";
                    });
                });
            } else {
                this.status = "home.loadingForecast";
                this.locatingComplete = true;
                console.log("Geolocation is not supported by this browser.");
                this.changeLocation(defaultLocation).then(() => {
                    this.status = "";
                });
            }
        },
        async setGpsLocation(lat: number, lon: number) {
            if(!lat || !lon) return;
            const location = await Weather.getWeatherByLatLon(lat, lon);
            if(!location.location.lat || !location.location.lon){
                location.location.lat = lat;
                location.location.lon = lon;
            }
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
        getWeather: (state: State) => (day: Date, hour: number = -1) => {
            if (!state.currentWeather) return;
            const out: any = {};
            const startTime = new Date(day.toDateString());
            const endTime = new Date(day.toDateString()).setHours(23, 59, 59, 999);

            Object.entries(state.currentWeather).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    out[key] = value.filter((item: any) => item.time >= startTime && item.time <= endTime);
                } else {
                    out[key] = value;
                }
            });

            if (hour === -1) return out;

            const hourOut: any = {};
            Object.entries(out).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    let over = false;
                    value.forEach((item: any) => {
                        if (item.time.getHours() === hour) {
                            if (isNaN(item.value)) over = true;
                            else hourOut[key] = item.value;
                        } else if (over && !isNaN(item.value)) hourOut[key] = item.value;
                        if (hourOut[key]) return;
                    });
                    if (!hourOut[key]) hourOut[key] = value[0]?.value;
                } else {
                    hourOut[key] = value;
                }
            });
            return hourOut;
        },
        getDays: (state: State) => () => {
            if (!state.currentWeather) return;
            const days: Date[] = [];
            const i: string[] = [];
            state.currentWeather.temperature.forEach((item: any) => {
                const dateString = item.time.toDateString();
                if (!i.includes(dateString)) {
                    days.push(new Date(dateString));
                    i.push(dateString);
                }
            });
            return days;
        }
    }
});
