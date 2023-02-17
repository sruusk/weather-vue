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
}

export default Settings;
