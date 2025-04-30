import { Page } from '@/components/Page.tsx';
import css from './OnboardingPage.module.css';
import classNames from 'classnames';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const OnboardingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname == '/onboarding') {
            navigate('/onboarding/1');
        }
    }, [location]);

    const checkIsPageActive = (page: number) => {
        const pg = location.pathname
            .replace('/onboarding', '')
            .replace('/', '');
        return Number(pg) >= page;
    };

    return (
        <Page back={false}>
            <div className={classNames(css.header)}>
                <div className={css.header_wrapper}>
                    <div className={css.stage_container}>
                        <div
                            className={classNames(css.stage, {
                                [css.stage__active]: checkIsPageActive(1),
                            })}
                            onClick={() => navigate('/onboarding/1')}
                        ></div>
                        <div
                            className={classNames(css.stage, {
                                [css.stage__active]: checkIsPageActive(2),
                            })}
                            onClick={() => navigate('/onboarding/2')}
                        ></div>
                        <div
                            className={classNames(css.stage, {
                                [css.stage__active]: checkIsPageActive(3),
                            })}
                            onClick={() => navigate('/onboarding/3')}
                        ></div>
                        <div
                            className={classNames(css.stage, {
                                [css.stage__active]: checkIsPageActive(4),
                            })}
                            onClick={() => navigate('/onboarding/4')}
                        ></div>
                        <div
                            className={classNames(css.stage, {
                                [css.stage__active]: checkIsPageActive(5),
                            })}
                            onClick={() => navigate('/onboarding/5')}
                        ></div>
                        <div
                            className={classNames(css.stage, {
                                [css.stage__active]: checkIsPageActive(6),
                            })}
                            onClick={() => navigate('/onboarding/6')}
                        ></div>
                    </div>
                    <div className={css.logo_container}>
                        <img
                            className={css.logo}
                            src="/img/logoFull.png"
                            alt="DreamTeam logo"
                        />
                    </div>
                </div>
            </div>
            <Outlet />
        </Page>
    );
};
