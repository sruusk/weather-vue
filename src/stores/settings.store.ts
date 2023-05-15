import { defineStore } from 'pinia';
import {DefaultLanguage} from "@/contants";

interface State {
    settings: {
        language: string;
        useLocation: boolean;
        weatherRadar: boolean;
    }
}

export const useSettingsStore = defineStore('settings', {
    state: (): State => {
        return {
            settings: JSON.parse(localStorage.getItem('settings') || JSON.stringify({
                language: DefaultLanguage,
                useLocation: true,
                weatherRadar: true,
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
        }
    },

    getters: {
        language: state => state.settings.language,
        useLocation: state => state.settings.useLocation,
        weatherRadar: state => state.settings.weatherRadar,
    }
});
