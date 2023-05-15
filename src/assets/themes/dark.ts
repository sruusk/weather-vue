import type { Theme } from '@/types';

export const dark: Theme = {
    name: 'dark',
    colours: {
        background: '#262626',
        backgroundDark: '#252525',
        backgroundDarker: '#181818',
        backgroundDarkest: '#0e0e0e',
        backgroundMediumLight: '#2a2a2a',
        backgroundLight: '#333333',
        backgroundLighter: '#404040',
        backgroundLightest: '#4d4d4d',
        backgroundGradient: 'linear-gradient(200deg,#4d4d4d 0%,#333333 100%)',
        backgroundObservations: 'linear-gradient(180deg, #4d4d4d 0%, #333333 100%)',
        backgroundSettingsItem: '#333333',
        selectedLight: '#333333',
    },
    invertRadar: true,
};
