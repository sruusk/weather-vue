import Vue from 'vue';
import { PiniaCustomProperties } from "pinia";

// Declare the $countries property on the Vue interface
declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $countries: {
            getName: (code: string, lang: string) => string | undefined;
            getAlpha2Code: (name: string, lang: string) => string | undefined;
        }
    }
}

// Declare the $countries property on the Pinia store interface
declare module 'pinia' {
    interface PiniaCustomProperties {
        $countries?: {
            getName: (code: string, lang: string) => string | undefined;
            getAlpha2Code: (name: string, lang: string) => string | undefined;
        }
    }
}
