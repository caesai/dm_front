import {
    backButton,
    viewport,
    themeParams,
    miniApp,
    initData,
    init as initSDK,
} from '@telegram-apps/sdk-react';

/**
 * Initializes the application and configures its dependencies.
 */
export function init(): void {
    initSDK();

    if (!backButton.isSupported() || !miniApp.isSupported()) {
        throw new Error('ERR_NOT_SUPPORTED');
    }

    // Mount all components used in the project.
    backButton.mount();
    miniApp.mountSync();
    themeParams.mountSync();
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
