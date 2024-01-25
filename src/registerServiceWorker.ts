// @ts-ignore
// noinspection JSUnusedLocalSymbols,JSDeprecatedSymbols

import {registerSW} from 'virtual:pwa-register';

const updateSW = registerSW({
    immediate: true,
    onNeedRefresh(registration: any) {
        document.dispatchEvent(new CustomEvent('swUpdated', {detail: registration}));
    },
    onRegistered(registration: any) {
        console.log('Service worker has been registered.');
        setInterval(() => {
            registration.update();
        }, 1000 * 60 * 60); // Check for updates every hour
    }
});
