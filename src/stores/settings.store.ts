import {defineStore} from 'pinia';
import {DefaultLanguage} from "@/constants";
import {useThemeStore, useWeatherStore} from "@/stores";

interface State {
    settings: {
        language: string;
        useLocation: boolean;
        weatherRadar: boolean;
        theme: string;
        useAnimations: boolean;
        forecastInterval: number;
    }
}

const defaults = {
    language: DefaultLanguage,
    useLocation: true,
    weatherRadar: true,
    theme: 'blue',
    useAnimations: true,
    forecastInterval: 1
}

export const useSettingsStore = defineStore('settings', {
    state: (): State => {
        return {
            settings: {
                ...defaults,
                ...JSON.parse(localStorage.getItem('settings') || JSON.stringify(defaults))
            }
        }
    },

    actions: {
        setLanguage(language: string) {
            this.settings.language = language;
            // @ts-ignore
            this.$i18n.global.locale = language;
            localStorage.setItem('settings', JSON.stringify(this.settings));
        },

        setUseLocation(useLocation: boolean) {
            this.settings.useLocation = useLocation;
            localStorage.setItem('settings', JSON.stringify(this.settings));
            const weatherStore = useWeatherStore();
            if(useLocation && !weatherStore.gpsLocation) {
                weatherStore.$reset();
                weatherStore.init();
            }
        },

        setWeatherRadar(weatherRadar: boolean) {
            this.settings.weatherRadar = weatherRadar;
            localStorage.setItem('settings', JSON.stringify(this.settings));
        },

        setTheme(theme: string) {
            this.settings.theme = theme;
            useThemeStore().setTheme(theme);
            localStorage.setItem('settings', JSON.stringify(this.settings));
        },

        setUseAnimations(useAnimations: boolean) {
            this.settings.useAnimations = useAnimations;
            localStorage.setItem('settings', JSON.stringify(this.settings));
        },

        setForecastInterval(interval: number) {
            this.settings.forecastInterval = interval;
            localStorage.setItem('settings', JSON.stringify(this.settings));
        }
    },

    getters: {
        language: (state: State) => state.settings.language,
        useLocation: (state: State) => state.settings.useLocation,
        weatherRadar: (state: State) => state.settings.weatherRadar,
        theme: (state: State) => state.settings.theme,
        useAnimations: (state: State) => state.settings.useAnimations,
        forecastInterval: (state: State) => state.settings.forecastInterval
    }
});
