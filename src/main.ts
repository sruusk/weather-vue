import { createApp } from 'vue'
// @ts-ignore // No type definitions available
import VueMobileDetection from "vue-mobile-detection";
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.use(VueMobileDetection);

app.mount('#app')
