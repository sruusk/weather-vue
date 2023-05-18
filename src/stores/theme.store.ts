import {defineStore} from "pinia";
import * as themes from '@/assets/themes';
import type {Theme} from "@/types";
import {useSettingsStore} from "@/stores/settings.store";

interface State {
    theme: Theme;
    themes: Theme[];
}

export const useThemeStore = defineStore('theme', {
    state: (): State => {
        return {
            theme: themes.blue,
            themes: Object.values(themes)
        }
    },

    actions: {
        setTheme(theme: string) {
            this.theme = this.themes.find((t: any) => t.name === theme) || themes.blue;
            Object.entries(this.theme.colours).forEach(([key, value]) => {
                // @ts-ignore
                document.querySelector('#app').style.setProperty(`--${key}`, value);
            });
            document.querySelector('meta[name="theme-color"]')?.setAttribute('content', this.theme.colours.background);
        }
    },

    getters: {

    }
});
