import React from 'react';
import classnames from 'classnames';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page.tsx';
import css from '@/pages/GastronomyPage/GastronomyPage.module.css';

export const GastronomyPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const goBack = () => {
            navigate(-1);
    };

    const getTitle = () => {
        if (location.pathname.includes('/basket')) {
            return 'Оформление';
        }
        else if (location.pathname.includes('/my')) {
            return 'Профиль';
        }
        return 'Новогодняя кулинария';
    };

    const getBackgroundColor = () => {
        if (location.pathname.includes('/my')) {
            return {backgroundColor: 'white'}
        }

        return undefined
    }

    const isBasketPage = location.pathname.includes('/basket');

    return (
        <Page back={true}>
            <div
                className={classnames(css.page, { [css.pageNoPadding]: isBasketPage })}
                style={getBackgroundColor()}
            >
                <div className={css.header}>
                    <RoundedButton
                        bgColor={'var(--primary-background)'}
                        icon={<BackIcon color={'var(--dark-grey)'} />}
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
