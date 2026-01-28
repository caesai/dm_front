import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';
// APIs
import { APIGetUserSubscriptions, APIPutUserSubscriptions } from '@/api/user.api.ts';
// Types
import { ISubscription } from '@/types/user.types.ts';
// Atoms
import { authAtom } from '@/atoms/userAtom.ts';
import { restaurantsListAtom } from '@/atoms/restaurantsListAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { SwitchButton } from '@/components/SwitchButton/SwitchButton.tsx';
// Styles
import css from '@/pages/NotificationsPage/NotificationsPage.module.css';
// Hooks
import useToastState from '@/hooks/useToastState.ts';

/**
 * Страница уведомлений.
 *
 * Позволяет пользователю управлять подписками на рекламные рассылки от ресторанов.
 * При переключении toggle отправляется запрос на бэкенд. В случае ошибки toggle
 * возвращается в исходное состояние и показывается toast с сообщением об ошибке.
 *
 * @component
 * @returns {JSX.Element} Компонент страницы уведомлений.
 */
export const NotificationsPage: React.FC = (): JSX.Element => {
    const [auth] = useAtom(authAtom);
    const restaurants = useAtomValue(restaurantsListAtom);
    const { showToast } = useToastState();
    const navigate = useNavigate();
    const goBack = () => {
        navigate('/profile');
    };
    const [subscriptions, setSubscriptions] = useState<ISubscription | null>(null);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (auth?.access_token) {
            APIGetUserSubscriptions(auth.access_token).then((res) => setSubscriptions(res.data));
        }
    }, [auth?.access_token]);

    /**
     * Обрабатывает переключение подписки на рекламные рассылки для конкретного ресторана.
     *
     * 1. Оптимистично обновляет UI (toggle переключается сразу)
     * 2. Отправляет запрос APIPutUserSubscriptions на бэкенд
     * 3. При ошибке — возвращает toggle в исходное состояние и показывает toast
     *
     * @param {string} restaurantId - ID ресторана для обновления подписки
     */
    const handleToggleSubscription = useCallback(
        async (restaurantId: string) => {
            if (!auth?.access_token || isUpdating) return;

            const previousValue = subscriptions?.[restaurantId] ?? false;
            const newValue = !previousValue;
            const updatedSubscriptions: ISubscription = {
                ...subscriptions,
                [restaurantId]: newValue,
            };

            // Оптимистичное обновление UI
            setSubscriptions(updatedSubscriptions);
            setIsUpdating(restaurantId);

            try {
                await APIPutUserSubscriptions(auth.access_token, updatedSubscriptions);
            } catch (error) {
                // Откат к предыдущему состоянию при ошибке
                setSubscriptions((prev) => ({
                    ...prev,
                    [restaurantId]: previousValue,
                }));
                showToast('Не удалось обновить настройку, попробуйте ещё раз.');
            } finally {
                setIsUpdating(null);
            }
        },
        [auth?.access_token, subscriptions, isUpdating, showToast]
    );
    return (
        <Page back={true} className={css.page}>
            <PageHeader title="Мои уведомления" goBack={goBack} />
            <ContentContainer className={css.content}>
                <p>Вы можете настроить, какие сообщения хотите получать от ресторанов. Важные сервисные сообщения останутся</p>
                <p><b>Ваши подписки на рекламные рассылки</b></p>
                {restaurants.map((restaurant) => (
                    <div key={restaurant.id} className={css.restaurant}>
                        <p className={css.restaurantTitle}>{restaurant.title}, {restaurant.address}</p>
                        <SwitchButton
                            checked={subscriptions?.[restaurant.id] || false}
                            toggle={() => handleToggleSubscription(restaurant.id)}
                            disabled={isUpdating === restaurant.id}
                        />
                    </div>
                ))}
            </ContentContainer>
        </Page>
    );
};