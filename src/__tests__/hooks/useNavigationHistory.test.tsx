import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { navigationHistoryAtom } from '@/atoms/navigationHistoryAtom.ts';
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';
import { useLocation } from 'react-router-dom';

// Mocking Telegram SDK to be able to run code outside
jest.mock('@telegram-apps/sdk-react', () => ({
    backButton: {
        show: jest.fn(),
        onClick: jest.fn(),
    },
}));
// --- ПОЛНОЕ МОКИРОВАНИЕ REACT-ROUTER-DOM ---
const mockedUseNavigate = jest.fn();
// const mockedUseLocation = jest.fn();

jest.mock('react-router-dom', () => ({
    // Предоставляем только те хуки, которые использует наш тестируемый хук
    useNavigate: () => mockedUseNavigate,
    useLocation: jest.fn(),
}));
/**
 * Вспомогательная функция для рендеринга хука с TestProvider,
 * без реальных компонентов Router.
 */
const renderHookWithProvider = (initialHistory: string[] = []) => {

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        // Используем TestProvider для инициализации атома Jotai
        <TestProvider initialValues={[[navigationHistoryAtom, initialHistory]]}>
            {children}
        </TestProvider>
    );

    return renderHook(() => useNavigationHistory(), { wrapper });
};

describe('useNavigationHistory', () => {
    // Сброс моков и атома перед каждым тестом
    beforeEach(() => {
        // Сбрасываем все моки перед каждым тестом
        jest.clearAllMocks();
        // Устанавливаем базовое значение для useLocation перед каждым тестом
        // Мы делаем это здесь, чтобы гарантировать, что мок готов до рендера хука
        (useLocation as jest.Mock).mockReturnValue({ pathname: '/default-path' });
    });

    test('должен инициализировать историю навигации и обновиться при первом рендере', async () => {
        const expectedPath = '/events';
        // Переопределяем мок useLocation специально для этого теста
        (useLocation as jest.Mock).mockReturnValue({ pathname: expectedPath });
        // Инициализируем хук на главной странице
        const { result } = renderHookWithProvider([]);
        // История должна содержать только '/events' после первого рендера
        // Ждем, пока состояние не обновится и не достигнет ожидаемого значения
        await waitFor(() => {
            // Эта проверка будет повторяться до тех пор, пока не станет истинной
            // или не истечет таймаут (обычно 1000 мс)
            expect(result.current.history).toEqual(['/events']);
        });
    });

    test('goBack должен вызывать navigate(-1) для обычной навигации', async () => {
        // 1. Имитируем историю из 3 страниц
        const initialHistory = ['/events', '/11', '/confirm'];
        // Устанавливаем текущий location как последнюю страницу
        (useLocation as jest.Mock).mockReturnValue({ pathname: '/confirm' });

        // 2. Рендерим хук с этой историей
        const { result } = renderHookWithProvider(initialHistory);

        // Ждем инициализации (хотя в beforeEach мы уже настроили initialValues, waitFor безопаснее)
        await waitFor(() => {
            expect(result.current.history).toEqual(initialHistory);
        });

        // 3. Вызываем функцию goBack внутри act()
        act(() => {
            result.current.goBack();
        });

        // 4. Проверяем, что mockedUseNavigate был вызван с аргументом -1
        expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
        expect(mockedUseNavigate).toHaveBeenCalledWith(-1);
    });
});
