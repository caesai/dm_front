import {
    backButton,
    viewport,
    themeParams,
    miniApp,
    initData,
    init as initSDK, locationManager,
} from '@telegram-apps/sdk-react';

/**
 * Initializes the application and configures its dependencies.
 */
export function init(): void {
    initSDK();

    if (!backButton.isSupported() || !miniApp.isSupported()) {
        throw new Error('ERR_NOT_SUPPORTED');
    }
        // const f = async () => {
        //     try {
        //         const promise = locationManager.mount();
        //         locationManager.isMounting(); // true
        //         await promise;
        //         locationManager.isMounting(); // false
        //         locationManager.isMounted(); // true
        //     } catch (err) {
        //         console.log("error", err);
        //         locationManager.mountError(); // equals "err"
        //         locationManager.isMounting(); // false
        //         locationManager.isMounted(); // false
        //     }
        // }
        // if (locationManager.mount.isAvailable()) {
        //     f().then();
        // }
    // Mount all components used in the project.
    backButton.mount();
    miniApp.mountSync();
    themeParams.mountSync();
    locationManager.mount();
    initData.restore();
    void viewport
        .mount()
        .catch((e) => {
            console.error('Something went wrong mounting the viewport', e);
        })
        .then(() => {
            viewport.bindCssVars();
        });

    // Define components-related CSS variables.
    miniApp.bindCssVars();
    themeParams.bindCssVars();
}
