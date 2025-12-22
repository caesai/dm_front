import {
    backButton,
    viewport,
    themeParams,
    miniApp,
    initData,
    init as initSDK,
    locationManager,
} from '@telegram-apps/sdk-react';

/**
 * Инициализация приложения и конфигурация его зависимостей.
 */
export function init(): void {
    initSDK();

    if (!backButton.isSupported() || !miniApp.isSupported()) {
        throw new Error('ERR_NOT_SUPPORTED');
    }
    // Монтирование всех компонентов, используемых в проекте.
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
            viewport.expand();
        });

    // Определение CSS переменных, связанных с компонентами.
    miniApp.bindCssVars();
    themeParams.bindCssVars();
}
