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
}

export default Settings;
