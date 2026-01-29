/**
 * @fileoverview Мок для localStorage для использования в тестах.
 * 
 * Предоставляет простую реализацию localStorage с возможностью очистки
 * и перехвата вызовов для тестирования.
 */

export const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

/**
 * Устанавливает мок localStorage в window для тестов
 */
export const setupLocalStorageMock = () => {
    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
    });
};
