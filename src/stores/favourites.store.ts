import {defineStore} from 'pinia';
import type {ForecastLocation, HourWeather} from '@/types';
import Weather from "@/weather";
import WeatherWorker from "@/workers/weather?worker";
import {useWeatherStore} from "@/stores/weather.store";

interface State {
    favourites: ForecastLocation[];
    favouriteWeathers: HourWeather[];
    history: ForecastLocation[];
}

export const useFavouritesStore = defineStore('favourites', {
    state: (): State => {
        return {
            favourites: [],
            favouriteWeathers: [],
            history: [],
        };
    },

    actions: {
        async init() {
            const favourites = localStorage.getItem('favourites');
            const history = localStorage.getItem('history');
            if (history) this.history = JSON.parse(history) as ForecastLocation[];
            if (favourites) this.favourites = JSON.parse(favourites) as ForecastLocation[];

            this.favouriteWeathers = [];
            this.locations.forEach((favourite: ForecastLocation) => { this.getWeather(favourite);})

            // Update weather every hour
            const loop = () => {
                const currentTime = new Date();
                const nextHour = new Date((new Date()).setHours(currentTime.getHours() + 1, 0, 0, 0));
                const timeout = nextHour.getTime() - currentTime.getTime();
                setTimeout(async () => {
                    this.favouriteWeathers = [];
                    this.locations.forEach((favourite: ForecastLocation) => { this.getWeather(favourite);})
                    loop();
                }, timeout);
            };
            loop();
        },
        async addFavourite(favourite: ForecastLocation) {
            const weatherStore = useWeatherStore();
            await this.getWeather(favourite);
            this.favourites.push(favourite);
            await weatherStore.changeLocation(favourite);
            localStorage.setItem('favourites', JSON.stringify(this.favourites));
        },
        addHistory(location: ForecastLocation) {
            const weatherStore = useWeatherStore();

            // If location is already a favourite, set location to favourite and return
            if(this.favourites.find(fav => fav.name === location.name && fav.region === location.region)) {
                weatherStore.changeLocation(location);
                return;
            }

            // If location is already the first history entry, change location and return
            if(this.history.length && this.history[0].name === location.name && this.history[0].region === location.region) {
                weatherStore.changeLocation(location);
                return;
            }

            this.getWeather(location);

            // Remove existing history entry to avoid duplicates and move it to the top
            if(this.history.find(loc => loc.name === location.name && loc.region === location.region)) {
                this.history = this.history.filter(loc => !(loc.name === location.name && loc.region === location.region));
            }

            this.history.unshift(location);
            if(this.history.length > 5) this.history.length = 5;
            weatherStore.changeLocation(location);
            localStorage.setItem('history', JSON.stringify(this.history));
        },
        removeFavourite(favourite: ForecastLocation) {
            const weatherStore = useWeatherStore();
            const index = this.favourites.findIndex(fav => fav.lat === favourite.lat && fav.lon === favourite.lon);
            this.favourites = this.favourites.filter(fav => fav.lat !== favourite.lat && fav.lon !== favourite.lon);
            localStorage.setItem('favourites', JSON.stringify(this.favourites));
            if (this.favourites.length === 0 && !weatherStore.locatingFailed) weatherStore.changeLocation(weatherStore.gpsLocation);
            else if (
                weatherStore.currentLocation.lat === favourite.lat
                && weatherStore.currentLocation.lon === favourite.lon
                && !weatherStore.locatingFailed) {
                if (this.favourites.length > index) weatherStore.changeLocation(this.favourites[index]);
                else weatherStore.changeLocation(this.favourites[index - 1]);
            } else if (
                weatherStore.currentLocation.lat === favourite.lat
                && weatherStore.currentLocation.lon === favourite.lon
                && weatherStore.locatingFailed
                && this.favourites.length > 0) {
                if (this.favourites.length > index) weatherStore.changeLocation(this.favourites[index]);
                else weatherStore.changeLocation(this.favourites[index - 1]);
            }
        },
        removeAllFavourites() {
            const weatherStore = useWeatherStore();
            this.favourites = [];
            localStorage.setItem('favourites', JSON.stringify(this.favourites));
            if (!weatherStore.locatingFailed) weatherStore.changeLocation(weatherStore.gpsLocation);
        },
        async clearHistory() {
            this.history = [];
            localStorage.setItem('history', JSON.stringify(this.history));
            const weatherStore = useWeatherStore();
            if(!weatherStore.locatingFailed) await weatherStore.changeLocation(weatherStore.gpsLocation);
            else if(this.favourites.length) await weatherStore.changeLocation(this.favourites[0]);
        },
        getWeather(favourite: ForecastLocation) {
            return new Promise<void>((resolve) => {
                if(window.Worker) {
                    const worker = new WeatherWorker();
                    worker.onmessage = (event) => {
                        this.favouriteWeathers.push({
                            ...event.data,
                            location: favourite,
                        });
                        resolve();
                    };
                    worker.postMessage({
                        lat: favourite.lat,
                        lon: favourite.lon,
                        type: "nextHour",
                    });
                } else {
                    Weather.getWeatherNextHour(favourite.lat, favourite.lon).then((weather) => {
                        this.favouriteWeathers.push({
                            time: `${weather.temperature[0].time.getHours()}:00`,
                            location: favourite,
                            temperature: weather.temperature[0].value,
                            windDirection: weather.windDirection[0].value,
                            windSpeed: weather.windSpeed[0].value,
                            windGust: weather.windGust[0].value,
                            weatherSymbol: weather.weatherSymbol[0].value,
                            precipitation: weather.precipitation[0].value,
                            probabilityOfPrecipitation: weather.probabilityOfPrecipitation ? weather.probabilityOfPrecipitation[0].value : undefined,
                            humidity: weather.humidity[0].value,
                            feelsLike: weather.feelsLike[0].value,
                        });
                        resolve();
                    });
                }
            });
        },
        saveFavourites() {
            localStorage.setItem('favourites', JSON.stringify(this.favourites));
        }
    },

    getters: {
        locations: (state: State) => {
            const history = Array.from(state.history);
            const locations = Array.from(state.favourites);
            if(history.length) locations.push(history.shift() as ForecastLocation);
            return locations;
        },
        getFavouriteWeather: (state: State) => (location: ForecastLocation) => {
            // Return empty weather if location has not loaded yet
            return state.favouriteWeathers.find(
                weather => weather.location.name === location.name && weather.location.region === location.region
            ) || {
                time: "",
                location: location,
                weatherSymbol: 0,
                temperature: 0,
                precipitation: 0,
                probabilityOfPrecipitation: 0,
                humidity: 0,
                windDirection: 0,
                windSpeed: 0,
                windGust: 0,
                feelsLike: 0,
            }
        },
    }
});
