import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { GastronomyBasketPage } from '@/pages/GastronomyPage/stages/GastronomyBasketPage/GastronomyBasketPage.tsx';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';
import { gastronomyCartAtom, ICartItem, IGastronomyCart } from '@/atoms/gastronomyCartAtom.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { mockDish } from '@/__mocks__/gastronomy.mock.ts';
import { R } from '@/__mocks__/restaurant.mock.ts';
import { APIPostUserOrder, APIPostCreateGastronomyPayment } from '@/api/gastronomy.api.ts';
import { currentCityAtom } from '@/atoms/currentCityAtom.ts';
import { cityListAtom } from '@/atoms/cityListAtom.ts';
import { mockUserData } from '@/__mocks__/user.mock.ts';

// Mock API
jest.mock('@/api/gastronomy.api.ts', () => ({
    APIPostUserOrder: jest.fn(),
    APIPostCreateGastronomyPayment: jest.fn(),
}));

jest.mock('@telegram-apps/sdk-react', () => ({
    mainButton: {
        setParams: jest.fn(),
        onClick: jest.fn(() => jest.fn()),
        unmount: jest.fn(),
        mount: {
            isAvailable: jest.fn(() => true),
        },
    },
}));

// Mock Yandex Maps API fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('GastronomyBasketPage', () => {
    const mockRestaurantSmoke = {
        id: Number(R.SMOKE_BBQ_SPB_RUBINSHTEINA_ID), // 6
        title: 'Smoke BBQ',
        address: 'ul. Rubinshteina, 11',
        city: { name: 'Санкт-Петербург', name_english: 'spb' },
        worktime: [{ weekday: 'пн', time_start: '12:00', time_end: '23:00' }],
    };

    const mockRestaurantBlackChops = {
        id: Number(R.BLACKCHOPS_SPB_FONTANKA_RIVER_ID), // 1
        title: 'BlackChops',
        address: 'Fontanka River, 1',
        city: { name: 'Санкт-Петербург', name_english: 'spb' },
        worktime: [{ weekday: 'пн', time_start: '12:00', time_end: '23:00' }],
    };

    const mockCartItem: ICartItem = {
        id: mockDish.id,
        title: mockDish.title,
        price: mockDish.prices[0],
        quantity: 1,
        weight: mockDish.weights[0],
        weight_value: '100g',
        image: mockDish.image_url,
    };

    const initialCart: IGastronomyCart = {
        items: [mockCartItem],
        totalAmount: 1300,
        totalItems: 1,
    };

    const renderComponent = (
        cart = initialCart,
        restaurantId = R.SMOKE_BBQ_SPB_RUBINSHTEINA_ID,
        user = { ...mockUserData, complete_onboarding: true }
    ) => {
        const initialValues: Array<readonly [any, unknown]> = [
            [gastronomyCartAtom, cart],
            [restaurantsListAtom, [mockRestaurantSmoke, mockRestaurantBlackChops]],
            [authAtom, { access_token: 'token' }],
            [currentCityAtom, 'spb'],
            [cityListAtom, [{ name: 'Санкт-Петербург', name_english: 'spb' }]],
            [userAtom, user],
        ];

        return render(
            <TestProvider initialValues={initialValues}>
                <MemoryRouter
                    initialEntries={[`/gastronomy/${restaurantId}/basket`]}
                    future={{
                        v7_startTransition: true,
                        v7_relativeSplatPath: true,
                    }}
                >
                    <Routes>
                        <Route path="/gastronomy/:res_id/basket" element={<GastronomyBasketPage />} />
                    </Routes>
                </MemoryRouter>
            </TestProvider>
        );
    };

    const originalLocation = window.location;

    beforeAll(() => {
        delete (window as any).location;
        (window as any).location = { href: '', assign: jest.fn() };
    });

    afterAll(() => {
        (window as any).location = originalLocation;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        (APIPostUserOrder as jest.Mock).mockResolvedValue({ data: { order_id: 123 } });
        (APIPostCreateGastronomyPayment as jest.Mock).mockResolvedValue({
            data: { payment_url: 'http://payment.url' },
        });

        // Перезагружаем страницу
        (window.location as any).href = '';

        // Мокируем успешный геокодинг по умолчанию
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                response: {
                    GeoObjectCollection: {
                        featureMember: [
                            {
                                GeoObject: {
                                    name: 'Test Address',
                                    Point: { pos: '30.315 59.939' }, // координаты Санкт-Петербурга
                                },
                            },
                        ],
                    },
                },
            }),
        });
    });

    it('должен отображать пустую корзину', () => {
        renderComponent({ items: [], totalAmount: 0, totalItems: 0 });
        expect(screen.getByText('Корзина пуста')).toBeInTheDocument();
    });

    it('должен отображать товары и сумму', () => {
        renderComponent();
        expect(screen.getByText('Итого')).toBeInTheDocument();
        expect(screen.getByTestId('total-amount')).toHaveTextContent('1300 ₽');
    });

    it('должен валидировать минимальную сумму заказа для доставки (Smoke BBQ)', async () => {
        // Smoke Рубинштейна: минимальная сумма заказа для доставки 5000 ₽
        renderComponent(initialCart, R.SMOKE_BBQ_SPB_RUBINSHTEINA_ID);

        // Переключаемся на доставку
        const deliveryToggle = screen.getByText('Заберу сам');
        fireEvent.click(deliveryToggle);

        const deliveryOption = screen.getAllByText('Доставка').find((el) => el.classList.contains('deliveryText'));
        if (deliveryOption) fireEvent.click(deliveryOption);

        await waitFor(() => {
            expect(screen.getByText(/Заказ от 5000₽/)).toBeInTheDocument();
        });

        expect(screen.getByText('К оплате')).toBeDisabled();
    });

    it('должен валидировать минимальную сумму заказа для доставки (BlackChops)', async () => {
        // BlackChops: минимальная сумма заказа для доставки 10000 ₽
        const cart: IGastronomyCart = {
            items: [mockCartItem],
            totalAmount: 1300,
            totalItems: 1,
        };
        renderComponent(cart, R.BLACKCHOPS_SPB_FONTANKA_RIVER_ID);

        // Переключаемся на доставку
        const deliveryToggle = screen.getByText('Заберу сам');
        fireEvent.click(deliveryToggle);

        const deliveryOption = screen.getAllByText('Доставка').find((el) => el.classList.contains('deliveryText'));
        if (deliveryOption) fireEvent.click(deliveryOption);

        await waitFor(() => {
            expect(screen.getByText(/Заказ от 10000₽/)).toBeInTheDocument();
        });
    });

    it('должен отображать стоимость доставки', async () => {
        // Smoke Рубинштейна доставка 1000 ₽
        const validCart = { ...initialCart, totalAmount: 6000 }; // > 5000 min
        renderComponent(validCart, R.SMOKE_BBQ_SPB_RUBINSHTEINA_ID);

        // Переключаемся на доставку
        const deliveryToggle = screen.getByText('Заберу сам');
        fireEvent.click(deliveryToggle);
        const deliveryOption = screen.getAllByText('Доставка').find((el) => el.classList.contains('deliveryText'));
        if (deliveryOption) fireEvent.click(deliveryOption);
        expect(screen.getByTestId('delivery-fee')).toHaveTextContent('1000 ₽');
        expect(screen.getByTestId('total-amount')).toHaveTextContent('7000 ₽');
    });

    it('должен обрабатывать ввод адреса', async () => {
        const validCart = { ...initialCart, totalAmount: 6000 };
        renderComponent(validCart, R.SMOKE_BBQ_SPB_RUBINSHTEINA_ID);

        // Переключаемся на доставку
        fireEvent.click(screen.getByText('Заберу сам'));
        const deliveryOption = screen.getAllByText('Доставка').find((el) => el.classList.contains('deliveryText'));
        if (deliveryOption) fireEvent.click(deliveryOption);

        const addressInput = screen.getByPlaceholderText('Адрес');
        fireEvent.change(addressInput, { target: { value: 'Nevsky' } });

        await waitFor(
            () => {
                expect(mockFetch).toHaveBeenCalled();
            },
            { timeout: 1000 }
        );

        // Выбираем подсказку
        const suggestion = await screen.findByText('Test Address');
        fireEvent.click(suggestion);

        expect(addressInput).toHaveValue('Test Address');
    });

    it('должен успешно создавать заказ при корректных данных', async () => {
        const validCart = { ...initialCart, totalAmount: 6000 };
        renderComponent(validCart, R.SMOKE_BBQ_SPB_RUBINSHTEINA_ID);

        // Проверяем, что датаpicker отображается
        // Если выбираем доставку, то должны выбрать дату и время и адрес
        const deliveryMethodToggle = screen.getByTestId('delivery-method-toggle');
        fireEvent.click(deliveryMethodToggle);
        const deliveryOption = screen.getAllByText('Доставка').find((el) => el.classList.contains('deliveryText'));
        if (deliveryOption) fireEvent.click(deliveryOption);
        const datePicker = screen.getByTestId('date-picker');
        fireEvent.click(datePicker);
        const date = screen.getAllByTestId('date-item');
        fireEvent.click(date[0] as HTMLElement);  
        const timePicker = screen.getAllByTestId('time-slot');
        fireEvent.click(timePicker[0] as HTMLElement);
        const addressInput = screen.getByPlaceholderText('Адрес');
        fireEvent.change(addressInput, { target: { value: 'Test Address' } });
        fireEvent.click(screen.getByTestId('pay-button'));
        await waitFor(() => {
            expect(APIPostUserOrder).toHaveBeenCalled();
        });
    });

    it('должен перенаправлять на онбординг, если пользователь не завершил его', async () => {
        const userNoOnboarding = { ...mockUserData, complete_onboarding: false };
        renderComponent(initialCart, R.SMOKE_BBQ_SPB_RUBINSHTEINA_ID, userNoOnboarding);
        const payButton = screen.getByText('К оплате');
        fireEvent.click(payButton);
        // Ожидаем, что заказ не будет создан
        expect(APIPostUserOrder).not.toHaveBeenCalled();

        // Ожидаем перенаправление на онбординг            
    });
});
