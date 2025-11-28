import React from 'react';
import classnames from 'classnames';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { Outlet, useLocation } from 'react-router-dom';
import { Page } from '@/components/Page.tsx';
import css from '@/pages/GastronomyPage/GastronomyPage.module.css';
import { useNavigationHistory } from '@/hooks/useNavigationHistory.tsx';

export const GastronomyPage: React.FC = () => {
    const { goBack } = useNavigationHistory();
    const location = useLocation();

    const getTitle = () => {
        if (location.pathname.includes('/basket')) {
            return 'Корзина';
        }
        else if (location.pathname.includes('/my')) {
            return 'Мои заказы';
        }
        return 'Новогодняя кулинария';
    };

    const getBackgroundColor = () => {
        if (location.pathname.includes('/my')) {
            return {backgroundColor: 'white'}
        }
        if (location.pathname.includes('/dish/')) {
            return {backgroundColor: '#F4F4F4'}
        }

        return undefined
    }

    const isBasketPage = location.pathname.includes('/basket');
    const isDishDetailsPage = location.pathname.includes('/dish/');

    return (
        <Page back={true}>
            <div
                className={classnames(css.page, { 
                    [css.pageNoPadding]: isBasketPage,
                    [css.pageNoGap]: isDishDetailsPage
                })}
                style={getBackgroundColor()}
            >
                <div className={classnames(css.header, { 
                    [css.headerWhite]: isDishDetailsPage,
                    [css.headerFullWidth]: isDishDetailsPage
                })}>
                    <RoundedButton
                        bgColor={'#F4F4F4'}
                        icon={<BackIcon color={'#545454'} />}
                        action={goBack}
                    />
                    <span className={css.header_title}>
                        {getTitle()}
                    </span>
                    <div className={css.spacer} />
                </div>
                <Outlet />
            </div>
        </Page>
    )
}
