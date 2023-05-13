import { defineStore } from 'pinia';
import type { ForecastLocation, HourWeather } from '@/types';
import Weather from "@/weather";
import {useWeatherStore} from "@/stores/weather.store";

interface State {
    favourites: ForecastLocation[];
    favouriteWeathers: HourWeather[];
    loading: boolean;
}

export const useFavouritesStore = defineStore('favourites', {
    state: (): State => {
        return {
            favourites: [],
            favouriteWeathers: [],
            loading: false,
        }
    },

    actions: {
        async init() {
            const favourites = localStorage.getItem('favourites');
            if (favourites) {
                this.favourites = JSON.parse(favourites) as ForecastLocation[];
                this.loading = true;
                this.favouriteWeathers = [];
                for (const favourite of this.favourites) {
                    await this.getWeather(favourite);
                }
                this.loading = false;
            }
        },
        addFavourite(favourite: ForecastLocation) {
            const weatherStore = useWeatherStore();
            this.favourites.push(favourite);
            this.getWeather(favourite);
            localStorage.setItem('favourites', JSON.stringify(this.favourites));
            if(this.favourites.length === 1 && weatherStore.locatingFailed) weatherStore.changeLocation(favourite);
        },
        removeFavourite(favourite: ForecastLocation) {
            const weatherStore = useWeatherStore();
            this.favourites = this.favourites.filter(fav => fav.name !== favourite.name);
            localStorage.setItem('favourites', JSON.stringify(this.favourites));
            if(this.favourites.length === 0 && !weatherStore.locatingFailed) weatherStore.changeLocation(weatherStore.gpsLocation);
            else if(weatherStore.locatingFailed && weatherStore.currentWeather?.location.name !== this.favourites[0].name) weatherStore.changeLocation(this.favourites[0]);
        },
        removeAllFavourites() {
            const weatherStore = useWeatherStore();
            this.favourites = [];
            localStorage.setItem('favourites', JSON.stringify(this.favourites));
            if(!weatherStore.locatingFailed) weatherStore.changeLocation(weatherStore.gpsLocation);
        },
        getWeather(favourite: ForecastLocation) {
            return new Promise<void>((resolve) => {
                Weather.getWeatherNextHour(`${favourite.name},${favourite.region}`).then((weather) => {
                    this.favouriteWeathers.push({
                        "time": `${(new Date(new Date().setHours(new Date().getHours() + 1))).getHours()}:00`,
                        "location": weather.location,
                        "temperature": weather.temperature[0].value,
                        "windDirection": weather.windDirection[0].value,
                        "windSpeed": weather.windSpeed[0].value,
                        "windGust": weather.windGust[0].value,
                        "weatherSymbol": weather.weatherSymbol[0].value,
                        "precipitation": weather.precipitation[0].value,
                        "probabilityOfPrecipitation": weather.probabilityOfPrecipitation ? weather.probabilityOfPrecipitation[0].value : undefined,
                        "humidity": weather.humidity[0].value,
                        "feelsLike": weather.feelsLike[0].value,
                    });
                    resolve();
                });
            });
        }
    },

    getters: {
        getFavouriteWeather: (state: State) => ( location: ForecastLocation ) => {
            return state.favouriteWeathers.find(
                weather => weather.location.name === location.name && weather.location.region === location.region
            );
        },
    }
});
