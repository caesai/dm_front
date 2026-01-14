/**
 * @fileoverview Тесты для компонента CertificatesPaymentPage
 *
 * Данный тестовый файл покрывает функциональность страницы оплаты сертификата:
 *
 * ## Тестируемые сценарии:
 *
 * ### 1. Загрузка сертификата
 * - Загрузка данных сертификата по ID из URL параметра `certificate_id`
 * - Отображение информации о сертификате (сообщение, номинал, получатель)
 * - Обработка ошибок при загрузке сертификата
 *
 * ### 2. Проверка статуса оплаты
 * - Проверка оплаты через API при наличии `order_number` в URL
 * - Отображение статуса "Ваш платёж обрабатывается" до подтверждения
 * - Отображение статуса "Ваш сертификат оплачен!" после подтверждения
 *
 * ### 3. Интеграция с eGift API
 * - Создание сертификата в eGift после успешной оплаты
 * - Проверка наличия `dreamteam_id` перед вызовом eGift API
 * - Обработка ошибок при создании сертификата в eGift
 *
 * ### 4. Интерактивность
 * - Функция "Поделиться" через `shareCertificate`
 * - Навигация на главную через кнопку "Позже"
 *
 * @module __tests__/certificates/CertificatesPaymentPage.test
 * @see {@link CertificatesPaymentPage} - Тестируемый компонент
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CertificatesPaymentPage } from '@/pages/CertificatesCreatePage/stages/CertificatesPaymentPage.tsx';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
import { APIGetCertificateById, APIGetCertificates, APIPostCertificateCheckPayment, APIPostEGiftCertificateOffline } from '@/api/certificates.api.ts';
import { shareCertificate } from '@/pages/CertificatesCreatePage/stages/CertificatesListPage.tsx';
import { ICertificate } from '@/types/certificates.types.ts';
import { mockUserData } from '@/__mocks__/user.mock.ts';
import { mockCertificateWithDreamteamId } from '@/__mocks__/certificates.mock.ts';

// Mock react-router-dom
const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate,
}));

// Mock API functions
jest.mock('@/api/certificates.api.ts', () => ({
    APIGetCertificateById: jest.fn(),
    APIGetCertificates: jest.fn(),
    APIPostCertificateCheckPayment: jest.fn(),
    APIPostEGiftCertificateOffline: jest.fn(),
}));

// Mock EGIFT_API_TOKEN и EGIFT_CLIENT_ID из base.ts (в тестовой среде import.meta.env = undefined)
jest.mock('@/api/base', () => ({
    ...jest.requireActual('@/api/base'),
    EGIFT_API_TOKEN: 'MOCK_EGIFT_API_TOKEN',
    EGIFT_CLIENT_ID: 'MOCK_EGIFT_CLIENT_ID',
}));

// Mock share utility
jest.mock('@/pages/CertificatesCreatePage/stages/CertificatesListPage.tsx', () => ({
    shareCertificate: jest.fn(),
}));

/**
 * Тестовый набор для компонента CertificatesPaymentPage
 *
 * @description
 * Тестирует полный жизненный цикл страницы оплаты сертификата:
 * - Загрузка и отображение данных сертификата
 * - Проверка статуса оплаты через Альфа-Банк API
 * - Создание сертификата в eGift после успешной оплаты
 * - Функции шаринга и навигации
 *
 * @remarks
 * Тесты используют моки для:
 * - API запросов (certificates.api.ts)
 * - React Router (useNavigate)
 * - eGift credentials (@/api/base)
 * - Функции shareCertificate
 * - Jotai atoms (auth, user, certificates)
 */
describe('CertificatesPaymentPage', () => {
    // Используем мок из __mocks__/certificates.mock.ts
    const mockCertificate = mockCertificateWithDreamteamId;

    /**
     * Рендерит компонент CertificatesPaymentPage с заданными параметрами
     *
     * @description
     * Хелпер-функция для рендеринга компонента в тестовом окружении.
     * Настраивает провайдеры, роутинг и начальные значения атомов.
     *
     * @param {string} initialPath - Начальный путь URL с query параметрами
     *        (по умолчанию: '/certificates/payment/?certificate_id=123&order_number=777')
     * @param {object} auth - Данные авторизации для authAtom
     *        (по умолчанию: { access_token: 'token' })
     * @param {IUser} user - Данные пользователя для userAtom
     *        (по умолчанию: mockUserData)
     *
     * @returns {RenderResult} Результат рендеринга из @testing-library/react
     *
     * @example
     * // Рендер с настройками по умолчанию
     * renderComponent();
     *
     * @example
     * // Рендер без order_number (не будет проверки оплаты)
     * renderComponent('/certificates/payment/?certificate_id=123');
     */
    const renderComponent = (
        initialPath = '/certificates/payment/?certificate_id=123&order_number=777',
        auth = { access_token: 'token' },
        user = mockUserData
    ) => {
        const initialValues: Array<readonly [any, unknown]> = [
            [authAtom, auth],
            [userAtom, user],
            [certificatesListAtom, []],
        ];

        return render(
            <TestProvider initialValues={initialValues}>
                <MemoryRouter
                    initialEntries={[initialPath]}
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <Routes>
                        <Route path="/certificates/payment/" element={<CertificatesPaymentPage />} />
                    </Routes>
                </MemoryRouter>
            </TestProvider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (APIGetCertificateById as jest.Mock).mockResolvedValue({ data: mockCertificate });
        (APIPostCertificateCheckPayment as jest.Mock).mockResolvedValue({
            data: { is_paid: false },
        });
        (APIGetCertificates as jest.Mock).mockResolvedValue({ data: [] });
        (APIPostEGiftCertificateOffline as jest.Mock).mockResolvedValue({ data: {} });
    });

    /**
     * Тест: Загрузка и отображение сертификата
     *
     * @description
     * Проверяет, что при монтировании компонента:
     * 1. Вызывается APIGetCertificateById с токеном и certificate_id из URL
     * 2. Вызывается APIPostCertificateCheckPayment с order_number из URL
     * 3. Обновляется список сертификатов через APIGetCertificates
     * 4. Отображается сообщение сертификата и статус обработки платежа
     */
    it('должен загружать и отображать сертификат по ID из URL', async () => {
        renderComponent();

        await waitFor(() => {
            expect(APIGetCertificateById).toHaveBeenCalledWith('token', '123');
            expect(APIPostCertificateCheckPayment).toHaveBeenCalledWith('token', 1, '777', '123');
            expect(APIGetCertificates).toHaveBeenCalledWith('token', 1);
        });

        expect(screen.getByTestId('certificate-message')).toHaveTextContent('Test Message');
        expect(screen.getByText('Ваш платёж обрабатывается')).toBeInTheDocument();
    });

    /**
     * Тест: Проверка статуса оплаты
     *
     * @description
     * Проверяет обработку успешной оплаты:
     * 1. APIPostCertificateCheckPayment возвращает { is_paid: true }
     * 2. Отображается сообщение "Ваш сертификат оплачен!"
     * 3. Обновляется список сертификатов пользователя
     */
    it('должен проверять статус оплаты, если передан order_number', async () => {
        (APIPostCertificateCheckPayment as jest.Mock).mockResolvedValue({
            data: { is_paid: true },
        });

        renderComponent();

        await waitFor(() => {
            expect(APIPostCertificateCheckPayment).toHaveBeenCalledWith('token', mockUserData.id, '777', '123');
        });

        expect(screen.getByText('Ваш сертификат оплачен!')).toBeInTheDocument();
        expect(APIGetCertificates).toHaveBeenCalled();
    });

    it('должен обрабатывать ошибку при получении сертификата', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        (APIGetCertificateById as jest.Mock).mockRejectedValue(new Error('Error getting certificate: Fetch error'));

        renderComponent();

        await waitFor(() => {
            expect(APIGetCertificateById).toHaveBeenCalled();
            expect(APIPostCertificateCheckPayment).not.toHaveBeenCalled();
            expect(screen.queryByTestId('certificate-message')).not.toBeInTheDocument();
            expect(screen.getByText('Сертификат не найден')).toBeInTheDocument();
        });
        consoleSpy.mockRestore();
    });

    it('должен вызывать shareCertificate при нажатии на кнопку "Поделиться"', async () => {
        (APIPostCertificateCheckPayment as jest.Mock).mockResolvedValue({
            data: { is_paid: true },
        });
        renderComponent();

        await waitFor(() => {
            expect(screen.getByTestId('certificate-message')).toBeInTheDocument();
            const shareButton = screen.getByText('Поделиться');
            fireEvent.click(shareButton);
        });
        expect(shareCertificate).toHaveBeenCalledWith(mockCertificate, screen.getByTestId('certificate-container'));
    });

    it('должен переходить на главную при нажатии на кнопку "Позже"', async () => {
        (APIPostCertificateCheckPayment as jest.Mock).mockResolvedValue({
            data: { is_paid: true },
        });
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Позже')).toBeInTheDocument();
        });

        const homeButton = screen.getByText('Позже');
        fireEvent.click(homeButton);

        expect(mockedNavigate).toHaveBeenCalledWith('/');
    });

    describe('Создание сертификата в eGift', () => {
        it('должен создавать сертификат в eGift после успешной оплаты, если dreamteam_id присвоен', async () => {
            // Сертификат с dreamteam_id
            const certificateWithDreamteamId: ICertificate = {
                ...mockCertificate,
                dreamteam_id: 'TEST_DREAMTEAM_ID',
            };

            // Сначала возвращаем сертификат без dreamteam_id (до оплаты)
            (APIGetCertificateById as jest.Mock).mockResolvedValueOnce({ data: mockCertificate });
            // Затем возвращаем сертификат с dreamteam_id (после оплаты)
            (APIGetCertificateById as jest.Mock).mockResolvedValueOnce({ data: certificateWithDreamteamId });

            (APIPostCertificateCheckPayment as jest.Mock).mockResolvedValue({
                data: { is_paid: true },
            });

            renderComponent();

            // Ждем проверки оплаты
            await waitFor(() => {
                expect(APIPostCertificateCheckPayment).toHaveBeenCalled();
            });

            // Ждем обновления сертификата и создания в eGift
            await waitFor(() => {
                expect(APIGetCertificateById).toHaveBeenCalledTimes(2); // Первый раз при загрузке, второй раз после оплаты
            });

            // Проверяем, что был вызван метод создания сертификата в eGift с мокированными токенами
            await waitFor(() => {
                expect(APIPostEGiftCertificateOffline).toHaveBeenCalledWith(
                    'MOCK_EGIFT_API_TOKEN', // Мокированный EGIFT_API_TOKEN
                    'MOCK_EGIFT_CLIENT_ID', // Мокированный EGIFT_CLIENT_ID
                    'TEST_DREAMTEAM_ID',
                    1000, // Number(certificate.value)
                    'tma'
                );
            });
        });

        it('не должен создавать сертификат в eGift, если dreamteam_id пустой', async () => {
            const certificateWithoutDreamteamId: ICertificate = {
                ...mockCertificate,
                dreamteam_id: '',
            };

            (APIGetCertificateById as jest.Mock).mockResolvedValueOnce({ data: mockCertificate });
            (APIGetCertificateById as jest.Mock).mockResolvedValueOnce({ data: certificateWithoutDreamteamId });

            (APIPostCertificateCheckPayment as jest.Mock).mockResolvedValue({
                data: { is_paid: true },
            });

            renderComponent();

            await waitFor(() => {
                expect(APIPostCertificateCheckPayment).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(APIGetCertificateById).toHaveBeenCalledTimes(2);
            });

            // Проверяем, что метод создания сертификата в eGift НЕ был вызван
            expect(APIPostEGiftCertificateOffline).not.toHaveBeenCalled();
        });

        it('не должен создавать сертификат в eGift, если оплата не прошла', async () => {
            (APIPostCertificateCheckPayment as jest.Mock).mockResolvedValue({
                data: { is_paid: false },
            });

            renderComponent();

            await waitFor(() => {
                expect(APIPostCertificateCheckPayment).toHaveBeenCalled();
            });

            // Проверяем, что метод создания сертификата в eGift НЕ был вызван
            expect(APIPostEGiftCertificateOffline).not.toHaveBeenCalled();
        });

        it('должен обрабатывать ошибку при создании сертификата в eGift', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const certificateWithDreamteamId: ICertificate = {
                ...mockCertificate,
                dreamteam_id: 'TEST_DREAMTEAM_ID',
            };

            (APIGetCertificateById as jest.Mock).mockResolvedValueOnce({ data: mockCertificate });
            (APIGetCertificateById as jest.Mock).mockResolvedValueOnce({ data: certificateWithDreamteamId });

            (APIPostCertificateCheckPayment as jest.Mock).mockResolvedValue({
                data: { is_paid: true },
            });

            (APIPostEGiftCertificateOffline as jest.Mock).mockRejectedValue(new Error('eGift API error'));

            renderComponent();

            await waitFor(() => {
                expect(APIPostCertificateCheckPayment).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(APIPostEGiftCertificateOffline).toHaveBeenCalled();
            });

            // Проверяем, что ошибка была залогирована
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
