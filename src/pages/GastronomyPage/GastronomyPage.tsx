import React, { useEffect } from 'react';
import classnames from 'classnames';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Page } from '@/components/Page.tsx';
import css from '@/pages/GastronomyPage/GastronomyPage.module.css';
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
import { useAtom } from 'jotai';
import { gastronomyDishesListAtom } from '@/atoms/dishesListAtom.ts';
import { userAtom } from '@/atoms/userAtom';

export const GastronomyPage: React.FC = () => {
    const [user] = useAtom(userAtom);
    const [, setDishesList] = useAtom(gastronomyDishesListAtom);

    const { goBack } = useNavigationHistory();
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();
    const paramsObject = Object.fromEntries(params.entries());

    const getTitle = () => {
        if (location.pathname.includes('/basket')) {
            return 'Корзина';
        } else if (location.pathname.includes('/my')) {
            return 'Мои заказы';
        }
        return 'Новогодняя кулинария';
    };

    const getBackgroundColor = () => {
        if (location.pathname.includes('/my')) {
            return { backgroundColor: 'white' };
        }
        if (location.pathname.includes('/dish/')) {
            return { backgroundColor: '#F4F4F4' };
        }

        return undefined;
    };

    const isBasketPage = location.pathname.includes('/basket');
    const isDishDetailsPage = location.pathname.includes('/dish/');

    // Если пользователь завершил onboarding, то очищаем список блюд
    // Это нужно для того, что бы при переходе после онбординга на страницу корзины сохранить стейт заказа
    useEffect(() => {
        return () => {
            if (user?.complete_onboarding) {
                setDishesList([]);
            }
        };
    }, [setDishesList, user?.complete_onboarding]);

    const handleGoBack = () => {
        if (!user?.complete_onboarding) {
            navigate('/onboarding/3');
            return;
        }
        if (paramsObject.shared) {
            navigate('/');
        } else {
            goBack();
        }
    };

    return (
        <Page back={true}>
            <div
                className={classnames(css.page, {
                    [css.pageNoPadding]: isBasketPage,
                    [css.pageNoGap]: isDishDetailsPage,
                })}
                style={getBackgroundColor()}
            >
                <div
                    className={classnames(css.header, {
                        [css.headerWhite]: isDishDetailsPage,
                        [css.headerFullWidth]: isDishDetailsPage,
                    })}
                >
                    <RoundedButton bgColor={'#F4F4F4'} icon={<BackIcon color={'#545454'} />} action={handleGoBack} />
                    <span className={css.header_title}>{getTitle()}</span>
                    <div className={css.spacer} />
                </div>
                <Outlet />
            </div>
        </Page>
    );
};
