class Settings {
    constructor() {

    }

    get location() {
        const location = localStorage.getItem('location');
        if (location) {
            return location === 'true';
        } else {
            return true;
        }
    }

    set location(value: boolean) {
        localStorage.setItem('location', value.toString());
    }

    get language() {
        const language = localStorage.getItem('language');
        if (language) {
            return language;
        } else {
            return 'en';
        }
    }

    set language(value: string) {
        localStorage.setItem('language', value);
    }

    get weatherRadar() {
        const weatherRadar = localStorage.getItem('weatherRadar');
        if (weatherRadar) {
            return weatherRadar === 'true';
        } else {
            return true;
        }
    }

    set weatherRadar(value: boolean) {
        localStorage.setItem('weatherRadar', value.toString());
    }
}

export default new Settings();
