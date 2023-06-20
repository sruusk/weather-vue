import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from "pinia";
import router from './router'
// @ts-ignore // No type definitions available
import VueMobileDetection from "vue-mobile-detection";
import countries from 'i18n-iso-countries';
import VueSplide from '@splidejs/vue-splide';
import './registerServiceWorker';
import { createI18n } from 'vue-i18n';
import {DefaultLanguage} from "@/contants";
import * as Sentry from "@sentry/vue";

// Import styles
import '@splidejs/vue-splide/css';

// Import locales
import en from '@/assets/locales/en.json'
import fi from '@/assets/locales/fi.json'
import sv from '@/assets/locales/sv.json'

const i18n = createI18n({
    locale: DefaultLanguage,
    messages: {
        en,
        fi,
        sv
    }
});

// Import country names
Promise.all([
    import('i18n-iso-countries/langs/en.json'),
    import('i18n-iso-countries/langs/fi.json'),
    import('i18n-iso-countries/langs/sv.json')
]).then((c) => {
    for(const country of c) countries.registerLocale(country);
});

const pinia = createPinia();
pinia.use(({ store }) => {
    store.$router = router;
    store.$i18n = i18n;
});

const app = createApp(App)
Sentry.init({
    app,
    dsn: "https://ed0d29ac19ab496ea0b414703ccf9192@o4505391298707456.ingest.sentry.io/4505391300018176",
    integrations: [
        new Sentry.BrowserTracing({
            // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
            tracePropagationTargets: [],
            routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        }),
        new Sentry.Replay(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});
app.use(pinia)
app.use(router)
app.use(VueMobileDetection);
app.use(i18n);
app.use(VueSplide);

app.mount('#app')
