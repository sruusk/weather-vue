import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    showInMenu: false
  },
  {
    path: '/favourites',
    name: 'Favourites',
    component: () => import('../views/FavouritesView.vue'),
    showInMenu: true
  },
  {
    path: '/warnings',
    name: 'Warnings',
    component: () => import('../views/WarningsView.vue'),
    showInMenu: true
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue'),
    showInMenu: true
  },
  {
    path: '/about',
    name: 'About and credits',
    component: () => import('../views/AboutView.vue'),
    showInMenu: true
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

export default router
export { routes }
