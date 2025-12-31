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

// Mock API
const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate,
}));

jest.mock('@/api/certificates.api.ts', () => ({
    APIGetCertificateById: jest.fn(),
    APIGetCertificates: jest.fn(),
    APIPostCertificateCheckPayment: jest.fn(),
    APIPostEGiftCertificateOffline: jest.fn(),
}));

// Mock share utility
jest.mock('@/pages/CertificatesCreatePage/stages/CertificatesListPage.tsx', () => ({
    shareCertificate: jest.fn(),
}));

describe('CertificatesPaymentPage', () => {
    const mockCertificate: ICertificate = {
        id: '123',
        customer_id: 1,
        payment_id: 1,
        recipient_id: 1,
        certificate_type: 'online',
        status: 'new',
        value: '1000',
        recipient_name: 'Test User',
        dreamteam_id: '1234567890',
        receipt_point: 1,
        receipt_date: '2025-01-01',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
        shared_at: null,
        expired_at: '2026-01-01',
        message: 'Test Message',
    };

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

            // Проверяем, что был вызван метод создания сертификата в eGift
            await waitFor(() => {
                expect(APIPostEGiftCertificateOffline).toHaveBeenCalledWith(
                    expect.any(String), // EGIFT_API_TOKEN
                    expect.any(String), // EGIFT_CLIENT_ID
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
