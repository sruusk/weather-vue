<template>
    <svg v-if="animate" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
            <linearGradient id="a" gradientUnits="userSpaceOnUse" x1="150" x2="234" y1="119.2" y2="264.8">
                <stop offset="0" stop-color="#fbbf24"/>
                <stop offset=".5" stop-color="#fbbf24"/>
                <stop offset="1" stop-color="#f59e0b"/>
            </linearGradient>
            <clipPath id="b">
                <path d="M0 0h512v306H0z" fill="none"/>
            </clipPath>
            <symbol id="c" viewBox="0 0 384 384">
                <circle cx="192" cy="192" fill="url(#a)" r="84" stroke="#f8af18" stroke-miterlimit="10"
                        stroke-width="6"/>
                <path d="M192 61.7V12m0 360v-49.7m92.2-222.5 35-35M64.8 319.2l35.1-35.1m0-184.4-35-35m254.5 254.5-35.1-35.1M61.7 192H12m360 0h-49.7" fill="none" stroke="#fbbf24" stroke-linecap="round" stroke-miterlimit="10"
                      stroke-width="24">
                    <animateTransform additive="sum" attributeName="transform" dur="6s" repeatCount="indefinite"
                                      type="rotate" values="0 192 192; 45 192 192"/>
                </path>
            </symbol>
        </defs>
        <g clip-path="url(#b)">
            <use height="384" transform="translate(64 100)" width="384" xlink:href="#c"/>
        </g>
        <path d="M100 332h300" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round"
              stroke-width="18"/>
    </svg>


    <svg v-else xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512">
        <defs>
            <linearGradient id="a" x1="149.99" y1="119.24" x2="234.01" y2="264.76" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#fbbf24"/>
                <stop offset="0.45" stop-color="#fbbf24"/>
                <stop offset="1" stop-color="#f59e0b"/>
            </linearGradient>
            <clipPath id="b">
                <rect width="512" height="306" fill="none"/>
            </clipPath>
            <symbol id="c" viewBox="0 0 384 384">
                <circle cx="192" cy="192" r="84" stroke="#f8af18" stroke-miterlimit="10" stroke-width="6" fill="url(#a)"/>
                <path d="M192,61.66V12m0,360V322.34M284.17,99.83l35.11-35.11M64.72,319.28l35.11-35.11m0-184.34L64.72,64.72M319.28,319.28l-35.11-35.11M61.66,192H12m360,0H322.34" fill="none" stroke="#fbbf24" stroke-linecap="round" stroke-miterlimit="10" stroke-width="24"/>
            </symbol>
        </defs>
        <g clip-path="url(#b)">
            <use width="384" height="384" transform="translate(64 100)" xlink:href="#c"/>
        </g>
        <line x1="110" y1="332" x2="400" y2="332" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round" stroke-width="18"/>
    </svg>

</template>

<script lang="ts">
    import {defineComponent} from 'vue';

    export default defineComponent({
        name: "BasicIcon.vue",
        props: {
            animate: {
                type: Boolean,
                default: false
            }
        }
    })
</script>
