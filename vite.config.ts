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
            base: '/',
            srcDir: 'src',
            filename: 'sw.js',
            strategies: 'generateSW',
            registerType: 'autoUpdate',
            includeAssets: [
                'icon.svg'
            ],
            manifest: {
                name: 'Weather',
                short_name: 'Weather',
                start_url: '/',
                description: 'Weather',
                theme_color: '#191c1f',
                background_color: '#191c1f',
                display: 'standalone',
                orientation: 'portrait',
                categories: ['weather'],
                icons: [
                    {
                        src: 'icons/pwa-144x144.png',
                        sizes: '144x144',
                        type: 'image/png'
                    },
                    {
                        src: 'icons/pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'icons/pwa-256x256.png',
                        sizes: '256x256',
                        type: 'image/png'
                    },
                    {
                        src: 'icons/pwa-384x384.png',
                        sizes: '384x384',
                        type: 'image/png'
                    },
                    {
                        src: 'icons/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
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
                ]
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
                        // Cache all requests to endpoints that start with /api/git
                        return url.pathname.startsWith('/api/git');
                    },
                    method: 'GET',
                    handler: 'StaleWhileRevalidate',
                    options: {
                        cacheName: 'git-api-cache',
                        broadcastUpdate: {
                            options: {}
                        },
                        cacheableResponse: {
                            statuses: [0, 200]
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
