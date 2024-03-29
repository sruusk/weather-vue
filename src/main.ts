import {createApp} from 'vue'
import App from './App.vue'
import {createPinia} from "pinia";
import router from './router'
// @ts-ignore // No type definitions available
import VueMobileDetection from "vue-mobile-detection";
import countries from 'i18n-iso-countries';
// @ts-ignore
import VueSplide from '@splidejs/vue-splide';
import './registerServiceWorker';
// @ts-ignore
import {createI18n} from 'vue-i18n';
import {DefaultLanguage} from "@/contants";

// Import styles
import '@splidejs/vue-splide/css';

// Import locales
import messages from '@intlify/unplugin-vue-i18n/messages'

const i18n = createI18n({
    locale: DefaultLanguage,
    messages
});

// Import country names
Promise.all([
    import('i18n-iso-countries/langs/en.json'),
    import('i18n-iso-countries/langs/fi.json'),
    import('i18n-iso-countries/langs/sv.json')
]).then((c) => {
    for (const country of c) countries.registerLocale(country);
});

const pinia = createPinia();
pinia.use(({store}) => {
    store.$router = router;
    store.$i18n = i18n;
});

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(VueMobileDetection);
app.use(i18n);
app.use(VueSplide);

app.mount('#app')
