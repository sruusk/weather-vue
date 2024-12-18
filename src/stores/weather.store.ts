import {defineStore} from 'pinia';
import Weather from "@/weather";
import WeatherWorker from "@/workers/weather?worker";
import {useAlertsStore, useFavouritesStore, useObservationsStore, useSettingsStore} from "@/stores";
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
    locationAccuracy: number;
}

export const useWeatherStore = defineStore('weather', {
    state: (): State => {
        return {
            currentWeather: undefined as WeatherType | undefined,
            status: "",
            locatingComplete: false,
            locationWeather: undefined as WeatherType | undefined,
            locationAccuracy: 0
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
                    this.locationAccuracy = Math.round(position.coords.accuracy);
                    console.log("Got location with accuracy of", this.locationAccuracy, "meters");
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
                            maximumAge: 600000, // 10 minutes
                            timeout: 5000
                        });
                    } else loadWeather(); // Location denied
                }, {
                    enableHighAccuracy: true,
                    maximumAge: 60000, // 1 minute
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
                    weather.location = this.getCountryName(weather.location);
                    console.log("Got GPS location", weather.location);
                    this.currentWeather = weather;
                    this.locationWeather = weather;
                    useObservationsStore().changeLocation(weather.location);
                    useAlertsStore().parseAlertsForLocation(weather.location);
                    resolve();
                }
                if (window.Worker) {
                    const worker = new WeatherWorker();
                    worker.onmessage = (event) => {
                        setLocation(event.data as WeatherType);
                    }
                    worker.postMessage({lat, lon});
                } else Weather.getWeatherByLatLon(lat, lon).then((weather) => {
                    setLocation(weather as WeatherType);
                    resolve();
                });
            });
        },
        changeLocation(location: ForecastLocation) {
            return new Promise<void>((resolve) => {
                if (!location
                    || (location.lat === this.currentLocation?.lat && location.lon === this.currentLocation?.lon)
                ) return resolve();
                if (location.country === 'Finland') {
                    useObservationsStore().changeLocation(location);
                    useAlertsStore().parseAlertsForLocation(location);
                }
                if (window.Worker) {
                    const worker = new WeatherWorker();
                    worker.onmessage = (event) => {
                        this.currentWeather = event.data as WeatherType;
                        this.currentWeather.location = location;
                        resolve();
                    }
                    worker.postMessage({lat: location.lat, lon: location.lon});
                } else Weather.getWeatherByLatLon(location.lat, location.lon).then((weather) => {
                    this.currentWeather = weather as WeatherType;
                    this.currentWeather.location = location;
                    resolve();
                });
            });
        },
        getCountryName(location: ForecastLocation): ForecastLocation {
            if(location.country === location.region && location.region?.length === 2)
                location.region = this.$countries?.getName(location.region, 'en') || location.region;
            if(location.country.length === 2)
                location.country = this.$countries?.getName(location.country, 'en') || location.country;
            return location;
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
            const hourOut: any = {};
            const startTime = new Date(day.toDateString());
            const endTime = new Date(day.toDateString()).setHours(23, 59, 59, 999);

            Object.entries(state.currentWeather).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    out[key] = value.filter((item: any) => item.time >= startTime && item.time <= endTime);
                    if (hour !== -1) {
                        let item = out[key].find((item: any) => item.time.getHours() >= hour);
                        hourOut[key] = item ? item.value : undefined;
                    } else out[key] = out[key].filter((item: any) => item.time.getTime() >= Date.now());
                } else {
                    out[key] = value;
                    hourOut[key] = value;
                }
            });

            return hour === -1 ? out : hourOut;
        },
        getDays: (state: State) => () => {
            if (!state.currentWeather) return;
            const days: Date[] = [];
            const i: string[] = [];
            state.currentWeather.temperature.forEach((item: any) => {
                const dateString = item.time.toDateString();
                if (!i.includes(dateString) && item.time.getHours() >= 15 && item.time.getTime() >= Date.now()) {
                    days.push(new Date(dateString));
                    i.push(dateString);
                }
            });
            return days;
        }
    }
});
