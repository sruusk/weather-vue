import type {ForecastLocation} from "@/types";

class Settings {
    constructor() {

    }

    static get location() {
        const location = localStorage.getItem('location');
        if (location) {
            return location === 'true';
        } else {
            return true;
        }
    }

    static set location(value: boolean) {
        localStorage.setItem('location', value.toString());
    }

    static get language() {
        const language = localStorage.getItem('language');
        if (language) {
            return language;
        } else {
            return 'en';
        }
    }

    static set language(value: string) {
        localStorage.setItem('language', value);
    }

    static get weatherRadar() {
        const weatherRadar = localStorage.getItem('weatherRadar');
        if (weatherRadar) {
            return weatherRadar === 'true';
        } else {
            return true;
        }
    }

    static set weatherRadar(value: boolean) {
        localStorage.setItem('weatherRadar', value.toString());
    }

    static get favourites() {
        const favourites = localStorage.getItem('favourites');
        if (favourites) {
            return JSON.parse(favourites) as ForecastLocation[];
        } else {
            return [] as ForecastLocation[];
        }
    }

    static set favourites(value: ForecastLocation[]) {
        localStorage.setItem('favourites', JSON.stringify(value));
    }

    static set useOpenWeather(value: boolean) {
        localStorage.setItem('useOpenWeather', value.toString());
    }

    static get useOpenWeather() {
        const useOpenWeather = localStorage.getItem('useOpenWeather');
        if (useOpenWeather) {
            return useOpenWeather === 'true';
        } else {
            return false; // Default to false, because by default there is no API key
        }
    }

    static set openWeatherApiKey(value: string) {
        localStorage.setItem('openWeatherApiKey', value);
    }

    static get openWeatherApiKey() {
        const openWeatherApiKey = localStorage.getItem('openWeatherApiKey');
        if (openWeatherApiKey) {
            return openWeatherApiKey;
        } else {
            return '';
        }
    }
}

export default Settings;
