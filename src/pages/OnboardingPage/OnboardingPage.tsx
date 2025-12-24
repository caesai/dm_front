import React, { useEffect } from 'react';
import classNames from 'classnames';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
// Components
import { Page } from '@/components/Page.tsx';
// Styles
import css from './OnboardingPage.module.css';
// Images
import logoNew from '/img/DT_concierge_logo_color1.svg';

export const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();
    const state = location?.state;

    useEffect(() => {
        if (location.pathname == '/onboarding') {
            navigate('/onboarding/1', { state });
        }
    }, [location]);

    const getCurrentPage = () => {
        const pg = location.pathname.replace('/onboarding', '').replace('/', '');
        return Number(pg) || 1;
    };

    const checkIsPageActive = (page: number) => {
        return getCurrentPage() >= page;
    };

    return (
        <Page back={false}>
            <div className={classNames(css.header)}>
                <div className={css.header_wrapper}>
                    {params.get('eventId') ? null : (
                        <div className={css.stage_container}>
                            <div
                                className={classNames(css.stage, {
                                    [css.stage__active]: checkIsPageActive(1),
                                })}
                                onClick={() => navigate('/onboarding/1', { state })}
                            ></div>
                            <div
                                className={classNames(css.stage, {
                                    [css.stage__active]: checkIsPageActive(2),
                                })}
                                onClick={() => navigate('/onboarding/2', { state })}
                            ></div>
                            <div
                                className={classNames(css.stage, {
                                    [css.stage__active]: checkIsPageActive(3),
                                })}
                                onClick={() => navigate('/onboarding/3', { state })}
                            ></div>
                            <div
                                className={classNames(css.stage, {
                                    [css.stage__active]: checkIsPageActive(4),
                                })}
                                onClick={() => navigate('/onboarding/4', { state })}
                            ></div>
                        </div>
                    )}
                    <div className={css.logo_container}>
                        <img className={css.logo} src={logoNew} alt="DreamTeam logo" />
                    </div>
                </div>
            </div>
            <Outlet />
        </Page>
    );
};
