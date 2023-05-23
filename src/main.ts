import { createApp } from 'vue'
// @ts-ignore // No type definitions available
import VueMobileDetection from "vue-mobile-detection";
import { createI18n } from 'vue-i18n'
import countries from 'i18n-iso-countries';
import App from './App.vue'
import { createPinia } from "pinia";
import router from './router'
import './registerServiceWorker';

// Import locales
import en from '@/assets/locales/en.json'
import fi from '@/assets/locales/fi.json'
import sv from '@/assets/locales/sv.json'

// Import country names
Promise.all([
    import('i18n-iso-countries/langs/en.json'),
    import('i18n-iso-countries/langs/fi.json'),
    import('i18n-iso-countries/langs/sv.json')
]).then((c) => {
    for(const country of c) countries.registerLocale(country);
});

const i18n = createI18n({
    locale: 'fi',
    messages: {
        en,
        fi,
        sv
    }
});

const pinia = createPinia();
pinia.use(({ store }) => {
    store.$router = router;
    store.$i18n = i18n;
});

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(VueMobileDetection);
app.use(i18n);

app.mount('#app')
