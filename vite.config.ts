import {fileURLToPath, URL} from 'node:url'
import { resolve } from 'path'
// @ts-ignore
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {VitePWA} from "vite-plugin-pwa";
const basePath = process.env.BASE_PATH || '/';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        VueI18nPlugin({
            include: [resolve(__dirname, './src/assets/locales/**')]
        }),
        VitePWA({
            integration: undefined,
            base: basePath,
            srcDir: 'src',
            filename: 'sw.js',
            strategies: 'generateSW',
            registerType: 'autoUpdate',
            includeAssets: [
                'logo.svg', 'weather-logo.svg'
            ],
            manifest: {
                name: 'Weather',
                short_name: 'Weather',
                start_url: '/',
              	id: '/',
                description: 'Weather',
                theme_color: '#000000',
                background_color: '#191c1f',
                display_override: ['window-controls-overlay', 'standalone'],
                display: 'standalone',
                // @ts-ignore
              	handle_links: 'preferred',
                edge_side_panel: {},
                orientation: 'portrait',
                categories: ['weather'],
                dir: 'ltr',
                icons: [
                    {
                        src: "icons/icon-maskable-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "maskable"
                    },
                    {
                        src: 'icons/icon-maskable-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    },
                    {
                        src: "icons/icon-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "any"
                    },
                    {
                        src: 'icons/icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any'
                    },
                ],
                screenshots: [
                    {
                        src: 'screenshots/screenshot-1.webp',
                        type: 'image/webp',
                        sizes: '1080x2291',
                        platform: 'narrow',
                        label: 'Home screen of the app'
                    },
                    {
                        src: 'screenshots/screenshot-1.webp',
                        type: 'image/webp',
                        sizes: '1080x2291',
                        platform: 'android',
                        // @ts-ignore
                        form_factor: 'wide',
                        label: 'Home screen of the app'
                    },
                    {
                        src: 'screenshots/screenshot-2.webp',
                        type: 'image/webp',
                        sizes: '1080x2276',
                        platform: 'narrow',
                        label: 'Home screen of the app'
                    },
                    {
                        src: 'screenshots/screenshot-3.webp',
                        type: 'image/webp',
                        sizes: '1080x2280',
                        platform: 'narrow',
                        label: 'Home screen of the app'
                    },
                    {
                        src: 'screenshots/screenshot-3.webp',
                        type: 'image/webp',
                        sizes: '1080x2280',
                        platform: 'ios',
                        label: 'Home screen of the app'
                    }
                ],
                // https://developer.mozilla.org/en-US/docs/Web/Manifest/shortcuts
                shortcuts: [
                    {
                        name: "Favourites",
                        url: "/favourites",
                        icons: [
                            {
                                src: 'icons/favourites-icon-512x512.png',
                                sizes: '512x512',
                                type: 'image/png'
                            },
                            {
                                src: 'icons/favourites-icon-96x96.png',
                                sizes: '96x96',
                                type: 'image/png'
                            }
                        ]
                    },
                    {
                        name: "Settings",
                        url: "/settings",
                        icons: [
                            {
                                src: "icons/settings-icon-512x512.png",
                                sizes: "512x512",
                                type: "image/png"
                            },
                            {
                                src: "icons/settings-icon-96x96.png",
                                sizes: "96x96",
                                type: "image/png"
                            }
                        ]
                    }
                ],
                // @ts-ignore
                launch_handler: {
                    client_mode: ['navigate-existing', 'focus-existing', 'auto']
                }
            },
            workbox: {
                mode: 'production',
                skipWaiting: true,
                sourcemap: false,
                navigateFallbackDenylist: [],
                maximumFileSizeToCacheInBytes: 30000000, // 30 MB (default: 2 MB)
                globPatterns: [
                    '**/*.{js,css,html,webp,jpg,svg,png,ico,webmanifest,txt,ttf,woff,woff2,otf,eot}'
                ],
                runtimeCaching: [{ // Cache the basemap and wms capabilities indefinitely
                    urlPattern: ({url}) => {
                        if (url.hostname === 'geo.stat.fi') return true
                        if (url.hostname === 'd17g5uoxmlqldj.cloudfront.net') return true
                    },
                    method: 'GET',
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'basemap-cache',
                        cacheableResponse: {
                            statuses: [0, 200]
                        }
                    }
                }, { // Cache the weather data for 10 minutes
                    urlPattern: ({url}) => {
                        if (url.hostname === 'opendata.fmi.fi') return true
                        if (url.href.includes('api.openweathermap.org/data/2.5/forecast')
                            || url.href.includes('api.openweathermap.org/data/3.0/onecall')) return true
                        if (url.href.includes('www.ilmatieteenlaitos.fi/geoserver/alert/')) return true
                    },
                    method: 'GET',
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'weather-data-cache',
                        cacheableResponse: {
                            statuses: [0, 200, 400]
                        },
                        expiration: {
                            maxAgeSeconds: 60 * 10 // 10 minutes
                        }
                    }
                }, { // Cache the alerts for 3 hours
                    urlPattern: ({url}) => {
                        if (url.hostname === 'alerts.fmi.fi') return true
                        if (url.hostname === 'corsproxy.io') return true
                        if (url.hostname === 'wwwi2.ymparisto.fi') return true
                    },
                    method: 'GET',
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'alert-cache',
                        cacheableResponse: {
                            statuses: [0, 200]
                        },
                        expiration: {
                            maxAgeSeconds: 60 * 60 * 3 // 3 hours
                        }
                    }
                }, {  // Cache the radar images for 30 minutes
                    urlPattern: ({url}) => {
                        if (url.hostname === 'data.fmi.fi') return true
                        if (url.href.includes('openwms.fmi.fi/geoserver/wms?service=wms&request=GetCapabilities')) return false
                        if (url.hostname === 'openwms.fmi.fi') return true
                    },
                    method: 'GET',
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'weather-radar-cache',
                        cacheableResponse: {
                            statuses: [0, 200]
                        },
                        expiration: {
                            maxAgeSeconds: 60 * 5 // 30 minutes
                        }
                    }
                }, {
                    urlPattern: ({url}) => {
                        if (url.href.includes('api.openweathermap.org/geo/1.0')) return true
                    },
                    method: 'GET',
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'geocoding-cache',
                        cacheableResponse: {
                            statuses: [0, 200]
                        }
                    }
                }],
            }
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        commonjsOptions: {
            esmExternals: true
        },
        target: 'esnext',
        sourcemap: true,
    }
})
