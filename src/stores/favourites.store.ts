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

                const loop = () => {
                    const currentTime = new Date();
                    const nextHour = new Date((new Date()).setHours(currentTime.getHours() + 1, 0, 0, 0));
                    const timeout = nextHour - currentTime;
                    setTimeout(async () => {
                        this.favouriteWeathers = [];
                        for (const favourite of this.favourites) {
                            await this.getWeather(favourite);
                        }
                        loop();
                    }, timeout);
                }
                loop();
            }
        },
        addFavourite(favourite: ForecastLocation) {
            const weatherStore = useWeatherStore();
            this.favourites.push(favourite);
            this.getWeather(favourite).then(() => {
                weatherStore.changeLocation(favourite);
            })
            localStorage.setItem('favourites', JSON.stringify(this.favourites));
        },
        removeFavourite(favourite: ForecastLocation) {
            const weatherStore = useWeatherStore();
            const index = this.favourites.findIndex(fav => fav.lat === favourite.lat && fav.lon === favourite.lon);
            this.favourites = this.favourites.filter(fav => fav.lat !== favourite.lat && fav.lon !== favourite.lon);
            localStorage.setItem('favourites', JSON.stringify(this.favourites));
            if(this.favourites.length === 0 && !weatherStore.locatingFailed) weatherStore.changeLocation(weatherStore.gpsLocation);
            else if(
                weatherStore.currentLocation.lat === favourite.lat
                && weatherStore.currentLocation.lon === favourite.lon
                && !weatherStore.locatingFailed) {
                if(this.favourites.length > index) weatherStore.changeLocation(this.favourites[index]);
                else weatherStore.changeLocation(this.favourites[index - 1]);
            } else if(
                weatherStore.currentLocation.lat === favourite.lat
                && weatherStore.currentLocation.lon === favourite.lon
                && weatherStore.locatingFailed
                && this.favourites.length > 0) {
                if(this.favourites.length > index) weatherStore.changeLocation(this.favourites[index]);
                else weatherStore.changeLocation(this.favourites[index - 1]);
            }
        },
        removeAllFavourites() {
            const weatherStore = useWeatherStore();
            this.favourites = [];
            localStorage.setItem('favourites', JSON.stringify(this.favourites));
            if(!weatherStore.locatingFailed) weatherStore.changeLocation(weatherStore.gpsLocation);
        },
        getWeather(favourite: ForecastLocation) {
            return new Promise<void>((resolve) => {
                Weather.getWeatherNextHour(favourite.lat, favourite.lon).then((weather) => {
                    this.favouriteWeathers.push({
                        "time": `${(new Date(new Date().setHours(new Date().getHours() + 1))).getHours()}:00`,
                        "location": favourite,
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
        },
        setFavourites(favourites: ForecastLocation[]) {
            this.favourites = favourites;
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
