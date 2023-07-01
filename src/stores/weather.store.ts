import {defineStore} from 'pinia';
import Weather from "@/weather";
import WeatherWorker from "@/workers/weather?worker";
import {useFavouritesStore, useObservationsStore, useSettingsStore} from "@/stores";
import type {ForecastLocation, Weather as WeatherType} from '@/types';

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
            if (this.locatingComplete) return;
            const favouritesStore = useFavouritesStore();
            const loadWeather = () => {
                this.status = "home.loadingForecast";
                this.locatingComplete = true;
                if (favouritesStore.favourites.length > 0) {
                    this.changeLocation(favouritesStore.favourites[0]).then(() => {
                        this.status = "";
                    });
                } else this.changeLocation(defaultLocation).then(() => {
                    this.status = "";
                });
            }
            if (!useSettingsStore().useLocation) loadWeather(); // Location disabled
            else if (navigator.geolocation) {
                console.log("Getting location...");
                this.status = "home.locating"
                const positionCallback = (position: GeolocationPosition) => {
                    this.status = "home.loadingForecast";
                    console.log("Got location with accuracy of", Math.round(position.coords.accuracy), "meters");
                    this.setGpsLocation(position.coords.latitude, position.coords.longitude).then(() => {
                        this.locatingComplete = true;
                        this.status = "";
                    });
                };
                navigator.geolocation.getCurrentPosition(positionCallback, (positionError) => {
                    console.error(`Geolocation error ${positionError?.code} ${positionError?.message}`);
                    if (positionError?.code === GeolocationPositionError.TIMEOUT) {
                        navigator.geolocation.getCurrentPosition(positionCallback, () => {
                            loadWeather();
                        }, {
                            enableHighAccuracy: false,
                            maximumAge: 300000, // 5 minutes
                            timeout: 5000
                        });
                    } else loadWeather(); // Location denied
                }, {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 10000
                });
            } else {
                console.log("Geolocation not supported");
                loadWeather(); // Geolocation not supported
            }

            // Update currentWeather every hour on the dot.
            const loop = () => {
                const currentTime = new Date();
                const nextHour = new Date((new Date()).setHours(currentTime.getHours() + 1, 0, 0, 0));
                const timeout = nextHour.getTime() - currentTime.getTime();
                setTimeout(() => {
                    const now = new Date();
                    this.currentWeather = Object.fromEntries(
                        Object.entries(this.currentWeather as any).map(([key, value]) => {
                            if (Array.isArray(value))
                                value = value.filter((point) => point.time >= now);
                            return [key, value];
                        })
                    ) as WeatherType;
                    loop();
                }, timeout);
            }
            loop();
        },
        setGpsLocation(lat: number, lon: number) {
            console.log("Setting GPS location", lat, lon);
            return new Promise<void>((resolve) => {
                if (!lat || !lon) return resolve();
                const setLocation = (weather: WeatherType) => {
                    weather.location.lat = lat;
                    weather.location.lon = lon;
                    this.currentWeather = weather;
                    this.locationWeather = weather;
                    useObservationsStore().changeLocation(weather.location);
                    resolve();
                }
                if (window.Worker) {
                    const worker = new WeatherWorker();
                    worker.onmessage = (event) => {
                        setLocation(event.data as WeatherType);
                    }
                    worker.postMessage({lat, lon});
                } else Weather.getWeatherByLatLon(lat, lon).then(setLocation);
            });
        },
        changeLocation(location: ForecastLocation) {
            return new Promise<void>((resolve) => {
                if (!location
                    || (location.lat === this.currentLocation?.lat && location.lon === this.currentLocation?.lon)
                ) return resolve();
                if (location.country === 'Finland') useObservationsStore().changeLocation(location);
                if (window.Worker) {
                    const worker = new WeatherWorker();
                    worker.onmessage = (event) => {
                        this.currentWeather = event.data as WeatherType;
                        this.currentWeather.location = location;
                        resolve();
                    }
                    worker.postMessage({lat: location.lat, lon: location.lon});
                } else Weather.getWeatherByLatLon(location.lat, location.lon).then((weather) => {
                    this.currentWeather = weather;
                    this.currentWeather.location = location;
                    resolve();
                });
            });
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
