import {fileURLToPath, URL} from 'node:url'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {VitePWA} from "vite-plugin-pwa";

// https://vitejs.dev/config/

export default defineConfig({
    plugins: [
        vue(),
        VueI18nPlugin({
            include: [fileURLToPath(new URL('./src/locales/**', import.meta.url))],
            defaultSFCLang: 'json'
        }),
        VitePWA({
            integration: undefined,
            base: '/',
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
                id: 'https://weather.a32.fi/',
                description: 'Weather',
                theme_color: '#191c1f',
                background_color: '#191c1f',
                display_override: ['window-controls-overlay', 'standalone'],
                display: 'standalone',
                orientation: 'portrait',
                categories: ['weather'],
                dir: 'ltr',
                icons: [
                    {
                        src: "icons/icon-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "maskable"
                    },
                    {
                        src: 'icons/icon-512x512.png',
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
                    }
                ],
                screenshots: [
                    {
                        src: 'screenshots/screenshot-1.webp',
                        type: 'image/webp',
                        sizes: '1084x2069',
                        platform: 'narrow',
                        label: 'Home screen of the app'
                    },
                    {
                        src: 'screenshots/screenshot-1.webp',
                        type: 'image/webp',
                        sizes: '1084x2069',
                        platform: 'android',
                        label: 'Home screen of the app'
                    },
                    {
                        src: 'screenshots/screenshot-2.webp',
                        type: 'image/webp',
                        sizes: '1440x2960',
                        platform: 'narrow',
                        label: 'Home screen of the app'
                    },
                    {
                        src: 'screenshots/screenshot-3.webp',
                        type: 'image/webp',
                        sizes: '1170x2532',
                        platform: 'narrow',
                        label: 'Home screen of the app'
                    },
                    {
                        src: 'screenshots/screenshot-3.webp',
                        type: 'image/webp',
                        sizes: '1170x2532',
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
                        name : "Settings",
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
                runtimeCaching: [{
                    urlPattern: ({ url }) => {
                        if(url.hostname === 'geo.stat.fi') return true
                        if(url.hostname === 'd17g5uoxmlqldj.cloudfront.net') return true
                    },
                    method: 'GET',
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'basemap-cache',
                        cacheableResponse: {
                            statuses: [0, 200]
                        }
                    }
                }, {
                    urlPattern: ({ url }) => {
                        if(url.hostname === 'opendata.fmi.fi') return true
                        if(url.hostname === 'api.openweathermap.org') return true
                        if(url.href.includes('www.ilmatieteenlaitos.fi/geoserver/alert/')) return true
                    },
                    method: 'GET',
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'weather-data-cache',
                        cacheableResponse: {
                            statuses: [0, 200]
                        },
                        expiration: {
                            maxAgeSeconds: 60 * 10 // 10 minutes
                        }
                    }
                }, {
                    urlPattern: ({ url }) => {
                        if(url.hostname === 'data.fmi.fi') return true
                        if(url.hostname === 'openwms.fmi.fi') return true
                    },
                    method: 'GET',
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'weather-radar-cache',
                        cacheableResponse: {
                            statuses: [0, 200]
                        },
                        expiration: {
                            maxAgeSeconds: 60 * 10 // 10 minutes
                        }
                    }
                }],
            }
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        commonjsOptions: {
            esmExternals: true
        }
    }
})
