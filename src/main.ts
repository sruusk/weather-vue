import { createApp } from 'vue'
// @ts-ignore // No type definitions available
import VueMobileDetection from "vue-mobile-detection";
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import { createPinia } from "pinia";
import router from './router'
import './registerServiceWorker';

// Import locales
import en from './locales/en.json'
import fi from './locales/fi.json'
import sv from './locales/sv.json'

const i18n = createI18n({
    locale: 'fi',
    messages: {
        en,
        fi,
        sv
    }
})

const pinia = createPinia();
pinia.use(({ store }) => {
    store.$router = router;
});

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(VueMobileDetection);
app.use(i18n);

app.mount('#app')
