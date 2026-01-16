import { act, renderHook } from '@testing-library/react';
import { gastronomyCartAtom, IGastronomyCart } from '@/atoms/gastronomyCartAtom.ts';
import { useGastronomyCart } from '@/hooks/useGastronomyCart.ts';
import { mockDish } from '@/__mocks__/gastronomy.mock.ts';
import { TestProvider } from '@/__mocks__/atom.mock.tsx';
import React from 'react';

describe('useGastronomyCart', () => {
    // Вспомогательная функция для рендера хука с провайдером
    const renderHookWithProvider = (initialHistory: IGastronomyCart = { items: [], totalAmount: 0, totalItems: 0 }) => {

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            // Используем TestProvider для инициализации атома Jotai
            <TestProvider initialValues={[[gastronomyCartAtom, initialHistory]]}>
                {children}
            </TestProvider>
        );

        return renderHook(() => useGastronomyCart(), { wrapper });
    };

    it('должен корректно инициализировать корзину с пустым состоянием', () => {
        const { result } = renderHookWithProvider();

        expect(result.current.cart.items).toHaveLength(0);
        expect(result.current.cart.totalItems).toBe(0);
        expect(result.current.cart.totalAmount).toBe(0);
    });

    it('должен добавлять новый товар в корзину', () => {
        const { result } = renderHookWithProvider();

        act(() => {
            // Добавляем блюдо с первым весом
            result.current.addToCart(mockDish, 0);
        });

        expect(result.current.cart.items).toHaveLength(1);
        expect(result.current.cart.items[0].id).toBe(1);
        expect(result.current.cart.items[0].quantity).toBe(1);
        expect(result.current.cart.totalItems).toBe(1);
        expect(result.current.cart.totalAmount).toBe(1300);
    });

    it('должен увеличивать количество существующего товара при повторном добавлении', () => {
        const { result } = renderHookWithProvider();

        act(() => {
            result.current.addToCart(mockDish, 0);
        });

        act(() => {
            result.current.addToCart(mockDish, 0); // Добавляем еще раз
        });

        expect(result.current.cart.items).toHaveLength(1); // Элемент остается один
        expect(result.current.cart.items[0].quantity).toBe(2); // Количество увеличивается
        expect(result.current.cart.totalItems).toBe(2);
        expect(result.current.cart.totalAmount).toBe(2600); // 1300 * 2
    });

    it('должен удалять одну единицу товара (уменьшать количество)', () => {
        const { result } = renderHookWithProvider();

        act(() => {
            result.current.addToCart(mockDish, 0);
            result.current.addToCart(mockDish, 0); // Quantity becomes 2
        });

        act(() => {
            result.current.removeFromCart(mockDish.id);
        });

        expect(result.current.cart.items).toHaveLength(1);
        expect(result.current.cart.items[0].quantity).toBe(1);
        expect(result.current.cart.totalItems).toBe(1);
        expect(result.current.cart.totalAmount).toBe(1300);
    });

    it('должен полностью удалять товар из списка, если количество становится 0', () => {
        const { result } = renderHookWithProvider();

        act(() => {
            result.current.addToCart(mockDish, 0); // Quantity becomes 1
        });

        act(() => {
            result.current.removeFromCart(mockDish.id);
        });

        expect(result.current.cart.items).toHaveLength(0);
        expect(result.current.cart.totalItems).toBe(0);
        expect(result.current.cart.totalAmount).toBe(0);
    });

    it('должен полностью очищать корзину с помощью clearCart', () => {
        const { result } = renderHookWithProvider();

        act(() => {
            result.current.addToCart(mockDish, 0);
            result.current.addToCart(mockDish, 0);
        });

        expect(result.current.cart.totalItems).toBe(2);

        act(() => {
            result.current.clearCart();
        });

        expect(result.current.cart.items).toHaveLength(0);
        expect(result.current.cart.totalItems).toBe(0);
        expect(result.current.cart.totalAmount).toBe(0);
    });

    it('должен возвращать правильное количество товара с помощью getItemQuantity', () => {
        const { result } = renderHookWithProvider();

        act(() => {
            result.current.addToCart(mockDish, 0);
            result.current.addToCart(mockDish, 0);
        });

        expect(result.current.getItemQuantity(mockDish.id)).toBe(2);
        expect(result.current.getItemQuantity(999)).toBe(0); // Несуществующий ID
    });
});
