import {createRouter, createWebHistory} from 'vue-router'
import LoadingView from "@/views/LoadingView.vue";
import {useWeatherStore} from "@/stores";

export const routes = [
    {
        path: '/loading',
        name: 'loading',
        component: LoadingView,
        showInMenu: false,
        beforeEnter: () => {
            const weatherStore = useWeatherStore();
            if (weatherStore.hasWeather) {
                return {name: 'home'};
            } else {
                return true;
            }
        }
    },
    {
        path: '/',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        showInMenu: false,
        beforeEnter: () => {
            const weatherStore = useWeatherStore();
            if (weatherStore.hasWeather) {
                return true;
            } else {
                return {name: 'loading'};
            }
        }
    },
    {
        path: '/favourites',
        name: 'favourites',
        component: () => import('@/views/FavouritesView.vue'),
        showInMenu: true
    },
    {
        path: '/warnings/:day?',
        name: 'warnings',
        component: () => import('@/views/WarningsView.vue'),
        showInMenu: true,
    },
    {
        path: '/symbols',
        name: 'symbols',
        component: () => import('@/views/SymbolsView.vue'),
        showInMenu: true
    },
    {
        path: '/settings',
        name: 'settings',
        component: () => import('@/views/SettingsView.vue'),
        showInMenu: true
    },
    {
        path: '/about',
        name: 'about',
        component: () => import('@/views/AboutView.vue'),
        showInMenu: true
    },
    {
        path: '/licenses',
        name: 'licenses',
        component: () => import('@/views/LicensesView.vue'),
        showInMenu: false
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        redirect: {name: 'home'},
        showInMenu: false
    }
]

// noinspection JSUnusedLocalSymbols
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
    scrollBehavior(to, from, savedPosition) {
        if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth'
            }
        } else {
            return {
                top: 0
            }
        }
    }
})

export default router
