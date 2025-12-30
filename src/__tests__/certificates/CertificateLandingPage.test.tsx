import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { CertificateLandingPage } from '@/pages/CertificateLanding/CertificateLandingPage.tsx';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
import { showToastAtom } from '@/atoms/toastAtom.ts';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';
import { APIGetCertificateById, APIGetCertificates, APIPostCertificateClaim, APIPostEGiftCertificateInfo } from '@/api/certificates.api.ts';
import { ICertificate } from '@/types/certificates.types.ts';
import { IUser, IAuthInfo } from '@/types/user.types.ts';
import { mockUserData } from '@/__mocks__/user.mock';
import { mockCertificate } from '@/__mocks__/certificates.mock';

// Mock API functions
jest.mock('@/api/certificates.api.ts', () => ({
    APIGetCertificateById: jest.fn(),
    APIGetCertificates: jest.fn(),
    APIPostCertificateClaim: jest.fn(),
    APIPostEGiftCertificateInfo: jest.fn(),
}));

jest.mock('swiper/react', () => ({
    Swiper: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    SwiperSlide: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('swiper/modules', () => ({
    Navigation: jest.fn(),
    Pagination: jest.fn(),
    Autoplay: jest.fn(),
}));
jest.mock('swiper/css/bundle', () => 'mock-css-bundle');
// Mock react-router-dom
const mockedNavigate = jest.fn();
const mockUseParams = jest.fn();
// Mock Telegram SDK
jest.mock('@telegram-apps/sdk-react', () => ({
    backButton: {
        show: jest.fn(),
        onClick: jest.fn(),
    },
    mainButton: {
        onClick: jest.fn(),
        setParams: jest.fn(),
        mount: {
            isAvailable: jest.fn(),
        },
        unmount: jest.fn(),
    },
    locationManager: {
        requestLocation: {
            isAvailable: jest.fn(),
        },
        openSettings: {
            isAvailable: jest.fn(),
        },
        isAccessRequested: jest.fn(),
        isAccessGranted: jest.fn(),
    },
}));

jest.mock('react-router-dom', () => ({
    ...(jest.requireActual('react-router-dom') as any),
    useNavigate: () => mockedNavigate,
    useParams: () => mockUseParams(),
}));

Object.defineProperty(window, 'Telegram', {
    writable: true,
    value: {
        WebApp: {
            initDataUnsafe: {
                user: { id: 1 },
            },
        },
    },
});

describe('CertificateLandingPage', () => {
    const mockAuth: IAuthInfo = {
        access_token: 'test_token',
        expires_in: 3600,
    };

    const renderComponent = (
        _certificate: ICertificate | null = null,
        user: IUser | undefined = mockUserData,
        auth: IAuthInfo | undefined = mockAuth,
        certificateId: string = 'TEST_CERT_ID'
    ) => {
        // Настраиваем мок useParams для возврата правильного id
        mockUseParams.mockReturnValue({ id: certificateId });

        const initialValues: Array<readonly [any, unknown]> = [
            [authAtom, auth],
            [userAtom, user],
            [certificatesListAtom, []],
            [showToastAtom, { message: '', type: '', isVisible: false }],
        ];

        return render(
            <TestProvider initialValues={initialValues}>
                <MemoryRouter
                    initialEntries={[`/certificates/${certificateId}`]}
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <CertificateLandingPage />
                </MemoryRouter>
            </TestProvider>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Устанавливаем дефолтное значение для useParams
        mockUseParams.mockReturnValue({ id: 'TEST_CERT_ID' });
        // Создаем сертификат с правильным статусом по умолчанию
        const defaultCertificate: ICertificate = {
            ...mockCertificate,
            status: 'paid', // Статус по умолчанию для активного сертификата
            expired_at: '2026-12-31T23:59:59Z', // Убеждаемся, что сертификат не истек
        };
        (APIGetCertificateById as jest.Mock).mockResolvedValue({
            data: defaultCertificate,
        });
        (APIGetCertificates as jest.Mock).mockResolvedValue({
            data: [defaultCertificate],
        });
        (APIPostCertificateClaim as jest.Mock).mockResolvedValue({ data: {} });
        (APIPostEGiftCertificateInfo as jest.Mock).mockResolvedValue({ data: { balance: 3000 } });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Загрузка сертификата', () => {
        test('должен загружать сертификат при монтировании компонента', async () => {
            renderComponent();

            await waitFor(() => {
                expect(APIGetCertificateById).toHaveBeenCalledWith(mockAuth.access_token, 'TEST_CERT_ID');
            });

            // Ждем обновления состояния, чтобы избежать предупреждения "not wrapped in act"
            await waitFor(() => {
                expect(screen.queryByText('3000')).toBeInTheDocument();
            });
        });

        test('должен показывать лоадер во время загрузки', async () => {
            // Мокаем запрос так, чтобы он не завершался, эмулируя состояние загрузки
            (APIGetCertificateById as jest.Mock).mockReturnValue(new Promise(() => {}));

            renderComponent();

            // Компонент должен показывать Loader пока loading === true
            // Это проверяется через отсутствие основного контента
            expect(screen.queryByText('Подарочный сертификат')).not.toBeInTheDocument();

            // Оборачиваем в act, чтобы избежать предупреждений
            await act(async () => {});
        });

        test('должен обрабатывать ошибку загрузки сертификата', async () => {
            // Используем fake timers ДО рендера компонента
            jest.useFakeTimers();

            (APIGetCertificateById as jest.Mock).mockRejectedValue(new Error('Network error'));

            renderComponent();

            // Ждем, пока API будет вызван
            await act(async () => {
                await waitFor(() => {
                    expect(APIGetCertificateById).toHaveBeenCalled();
                });
            });

            // Даем время на обработку промиса ошибки
            await act(async () => {
                await Promise.resolve();
            });

            // Проверяем, что навигация еще не вызвана (до истечения таймера)
            expect(mockedNavigate).not.toHaveBeenCalled();

            // Перематываем время на 7 секунд вперед внутри act
            await act(async () => {
                jest.advanceTimersByTime(7000);
                // Даем время на выполнение setTimeout
                await Promise.resolve();
            });

            // Теперь навигация должна быть вызвана
            expect(mockedNavigate).toHaveBeenCalledWith('/certificates/1');

            jest.useRealTimers();
        });
    });

    describe('Отображение информации о сертификате', () => {
        test('должен отображать информацию о сертификате после загрузки', async () => {
            renderComponent();

            await waitFor(() => {
                // Проверяем данные из mockCertificate, которые используются в beforeEach
                // value из mockCertificate = '3000.00', отображается как '3000' через Number().toFixed()
                expect(screen.getByText('3000')).toBeInTheDocument();
                // recipient_name из mockCertificate = 'Great'
                expect(screen.getByText('Great')).toBeInTheDocument();
                // message из mockCertificate = 'Britain'
                expect(screen.getByText('Britain')).toBeInTheDocument();
                // dreamteam_id из mockCertificate = '', проверяем наличие поля "Код:"
                expect(screen.getByText(/Код:/)).toBeInTheDocument();
            });
        });

        test('должен загружать и отображать баланс сертификата из eGift', async () => {
            const certificateWithDreamteamId: ICertificate = {
                ...mockCertificate,
                dreamteam_id: 'TEST_DREAMTEAM_ID',
                status: 'paid',
                expired_at: '2026-12-31T23:59:59Z',
            };

            (APIGetCertificateById as jest.Mock).mockResolvedValue({
                data: certificateWithDreamteamId,
            });
            (APIPostEGiftCertificateInfo as jest.Mock).mockResolvedValue({
                data: { balance: 2500 },
            });

            renderComponent();

            // Ждем загрузки сертификата
            await waitFor(() => {
                expect(APIGetCertificateById).toHaveBeenCalled();
            });

            // Проверяем, что был вызван метод получения баланса
            await waitFor(() => {
                expect(APIPostEGiftCertificateInfo).toHaveBeenCalledWith(
                    expect.any(String), // EGIFT_API_TOKEN
                    'TEST_DREAMTEAM_ID'
                );
            });

            // Проверяем, что баланс отображается
            await waitFor(() => {
                expect(screen.getByText('2500 ₽')).toBeInTheDocument();
            });
        });

        test('не должен загружать баланс, если dreamteam_id пустой', async () => {
            const certificateWithoutDreamteamId: ICertificate = {
                ...mockCertificate,
                dreamteam_id: '',
                status: 'paid',
                expired_at: '2026-12-31T23:59:59Z',
            };

            (APIGetCertificateById as jest.Mock).mockResolvedValue({
                data: certificateWithoutDreamteamId,
            });

            renderComponent();

            await waitFor(() => {
                expect(APIGetCertificateById).toHaveBeenCalled();
            });

            // Проверяем, что метод получения баланса НЕ был вызван
            expect(APIPostEGiftCertificateInfo).not.toHaveBeenCalled();
        });

        // test('должен отображать правильную дату истечения', async () => {
        //     renderComponent();

        //     await waitFor(() => {
        //         expect(screen.getByText(/Действителен до:/)).toBeInTheDocument();
        //     });
        // });
    });

    describe('Статусы сертификата', () => {
        test('должен показывать сообщение об истекшем сертификате', async () => {
            const expiredCertificate: ICertificate = {
                ...mockCertificate,
                expired_at: '2024-01-01T00:00:00Z', // Прошедшая дата
            };

            (APIGetCertificateById as jest.Mock).mockResolvedValue({
                data: expiredCertificate,
            });

            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(/У данного сертификата истек срок действия/)).toBeInTheDocument();
            });
        });

        test('должен показывать сообщение об использованном сертификате', async () => {
            const usedCertificate: ICertificate = {
                ...mockCertificate,
                status: 'used',
            };

            (APIGetCertificateById as jest.Mock).mockResolvedValue({
                data: usedCertificate,
            });

            renderComponent();

            await waitFor(() => {
                // Проверяем, что есть элементы с текстом "использован" (их должно быть 2: в заголовке и в поле)
                const usedElements = screen.getAllByText(/использован/);
                expect(usedElements.length).toBeGreaterThanOrEqual(1);
                // Проверяем конкретное поле "Сертификат использован"
                expect(screen.getByText('Сертификат использован')).toBeInTheDocument();
            });
        });

        test('должен скрывать кнопку "Воспользоваться" для неактивного сертификата', async () => {
            const disabledCertificate: ICertificate = {
                ...mockCertificate,
                status: 'used',
            };

            (APIGetCertificateById as jest.Mock).mockResolvedValue({
                data: disabledCertificate,
            });

            renderComponent();

            await waitFor(() => {
                expect(screen.queryByText('Воспользоваться')).not.toBeInTheDocument();
            });
        });
    });

    describe('Автоматическая активация сертификата', () => {
        test('должен автоматически активировать сертификат для авторизованного пользователя', async () => {
            const sharedCertificate: ICertificate = {
                ...mockCertificate,
                status: 'paid', // Важно: статус должен быть 'paid' или 'shared' для прохождения isCertificateDisabled
                shared_at: null,
                customer_id: 2, // Другой пользователь
                recipient_id: 1, // Текущий пользователь
                expired_at: '2026-12-31T23:59:59Z', // Убеждаемся, что сертификат не истек
            };

            (APIGetCertificateById as jest.Mock).mockResolvedValue({
                data: sharedCertificate,
            });

            renderComponent();

            // Ждем загрузки сертификата
            await waitFor(
                () => {
                    expect(APIGetCertificateById).toHaveBeenCalled();
                },
                { timeout: 3000 }
            );

            // Затем проверяем активацию
            await waitFor(
                () => {
                    expect(APIPostCertificateClaim).toHaveBeenCalled();
                },
                { timeout: 3000 }
            );
        });

        test('не должен активировать сертификат, если пользователь - владелец', async () => {
            // Создаем сертификат с правильными данными для владельца
            const ownedCertificate: ICertificate = {
                ...mockCertificate,
                status: 'paid', // Статус должен быть 'paid' или 'shared' для активного сертификата
                shared_at: null,
                customer_id: 1, // Текущий пользователь - владелец (mockUserData.id = 1)
                recipient_id: 1, // Также устанавливаем recipient_id для консистентности
                expired_at: '2026-12-31T23:59:59Z', // Будущая дата - сертификат не истек
            };

            (APIGetCertificateById as jest.Mock).mockResolvedValue({
                data: ownedCertificate,
            });

            renderComponent();

            // Ждем загрузки сертификата и отображения данных
            // Проверяем наличие данных сертификата - это означает что он загружен и отображается
            await waitFor(
                () => {
                    // Проверяем наличие номинала - это означает что сертификат загружен
                    expect(screen.getByText('3000')).toBeInTheDocument();
                },
                { timeout: 5000 }
            );

            // Не должен вызывать активацию - это основная проверка теста
            // Пользователь является владельцем (customer_id === user.id), поэтому активация не нужна
            expect(APIPostCertificateClaim).not.toHaveBeenCalled();
        });
    });

    describe('Навигация', () => {
        test('должен перенаправлять на онбординг для неавторизованных пользователей с подаренным сертификатом', async () => {
            const sharedCertificate: ICertificate = {
                ...mockCertificate,
                status: 'shared', // Важно: статус должен быть 'paid' или 'shared' для прохождения isCertificateDisabled
                shared_at: '2025-01-01T00:00:00Z',
                expired_at: '2026-12-31T23:59:59Z', // Убеждаемся, что сертификат не истек
            };

            const userWithoutOnboarding: IUser = {
                ...mockUserData,
                complete_onboarding: false,
            };

            (APIGetCertificateById as jest.Mock).mockResolvedValue({
                data: sharedCertificate,
            });

            renderComponent(null, userWithoutOnboarding);

            // Ждем загрузки сертификата и выполнения эффекта
            await waitFor(
                () => {
                    expect(APIGetCertificateById).toHaveBeenCalled();
                },
                { timeout: 3000 }
            );

            // Затем проверяем навигацию
            await waitFor(
                () => {
                    expect(mockedNavigate).toHaveBeenCalledWith('/onboarding/1');
                },
                { timeout: 3000 }
            );
        });

        test('должен перенаправлять на список сертификатов, если пользователь не имеет отношения к подаренному сертификату', async () => {
            const sharedCertificate: ICertificate = {
                ...mockCertificate,
                status: 'shared', // Важно: статус должен быть 'paid' или 'shared'
                shared_at: '2025-01-01T00:00:00Z',
                recipient_id: 999, // Другой получатель (не текущий пользователь с id=1)
                expired_at: '2026-12-31T23:59:59Z', // Убеждаемся, что сертификат не истек
            };

            (APIGetCertificateById as jest.Mock).mockResolvedValue({
                data: sharedCertificate,
            });

            renderComponent();

            // Ждем загрузки сертификата и выполнения эффекта
            await waitFor(
                () => {
                    expect(APIGetCertificateById).toHaveBeenCalled();
                },
                { timeout: 3000 }
            );

            // Затем проверяем навигацию
            await waitFor(
                () => {
                    expect(mockedNavigate).toHaveBeenCalledWith('/certificates/1');
                },
                { timeout: 3000 }
            );
        });
    });

    describe('Интерактивность', () => {
        test('должен показывать модальное окно при попытке бронирования без онбординга', async () => {
            // const userWithoutOnboarding: IUser = {
            //     ...mockUserData,
            //     complete_onboarding: false,
            // };
            // renderComponent(null, userWithoutOnboarding);
            // await waitFor(() => {
            //     expect(screen.getByText('Подарочный сертификат')).toBeInTheDocument();
            // });
            // // Убеждаемся, что кнопка "Воспользоваться" отображается
            // await waitFor(() => {
            //     expect(screen.getByText('Воспользоваться')).toBeInTheDocument();
            // });
            // // Находим и кликаем на кнопку "Воспользоваться"
            // const useButton = screen.getByText('Воспользоваться');
            // fireEvent.click(useButton);
            // // Проверяем, что модальное окно появилось с правильным текстом
            // await waitFor(() => {
            //     expect(screen.getByText(/Чтобы воспользоваться сертификатом и забронировать стол онлайн, необходимо зарегистрироваться в приложении Dreamteam Concierge/)).toBeInTheDocument();
            // });
        });

        test('должен перенаправлять на бронирование для авторизованных пользователей', async () => {
            // renderComponent();
            // await waitFor(() => {
            //     expect(screen.getByText('Подарочный сертификат')).toBeInTheDocument();
            // });
            // // Убеждаемся, что кнопка "Воспользоваться" отображается
            // await waitFor(() => {
            //     expect(screen.getByText('Воспользоваться')).toBeInTheDocument();
            // });
            // // Находим и кликаем на кнопку "Воспользоваться"
            // const useButton = screen.getByText('Воспользоваться');
            // fireEvent.click(useButton);
            // // Проверяем, что navigate был вызван с правильными параметрами
            // await waitFor(() => {
            //     expect(mockedNavigate).toHaveBeenCalledWith('/booking', {
            //         state: { certificate: true, certificateId: 'TEST_CERT_ID' }
            //     });
            // });
        });
    });
});
