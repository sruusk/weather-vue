import { defineStore } from 'pinia';
import {DefaultLanguage} from "@/contants";
import {useThemeStore} from "@/stores/theme.store";

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

export const useSettingsStore = defineStore('settings', {
    state: (): State => {
        return {
            settings: JSON.parse(localStorage.getItem('settings') || JSON.stringify({
                language: DefaultLanguage,
                useLocation: true,
                weatherRadar: true,
                theme: 'blue',
                useAnimations: true,
                forecastInterval: 1
            }))
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
        language: state => state.settings.language,
        useLocation: state => state.settings.useLocation,
        weatherRadar: state => state.settings.weatherRadar,
        theme: state => state.settings.theme,
        useAnimations: state => state.settings.useAnimations,
        forecastInterval: state => state.settings.forecastInterval
    }
});
