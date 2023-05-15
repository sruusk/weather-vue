import type { Theme } from '@/types';

export const blue: Theme = {
    name: 'blue',
    colours: {
        background: '#1d225c',
        backgroundDark: '#1d2e5d',
        backgroundDarker: '#111a2e',
        backgroundDarkest: '#111a2d',
        backgroundLight: '#274498',
        backgroundLighter: '#3559b9',
        backgroundLightest: '#5582cd',
        backgroundGradient: 'linear-gradient(200deg,#5582cd 0%,#242282 100%)',
        backgroundMediumLight: '#253e80',
        backgroundObservations: 'linear-gradient(180deg, #456fc8 0%, #242282 100%)',
        backgroundSettingsItem: '#253478',
        selectedLight: '#243f82',
    },
    invertRadar: false,
};
