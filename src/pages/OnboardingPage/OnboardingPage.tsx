import {Page} from '@/components/Page.tsx';
import css from './OnboardingPage.module.css';
import classNames from 'classnames';
import {Outlet, useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {useEffect} from 'react';
import logoNew from "/img/DT_concierge_logo_color1.svg";

export const OnboardingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();

    useEffect(() => {
        if (location.pathname == '/onboarding') {
            navigate('/onboarding/1');
        }
    }, [location]);

    const getCurrentPage = () => {
        const pg = location.pathname
            .replace('/onboarding', '')
            .replace('/', '');
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
                        </div>
                    )}
                    <div className={css.logo_container}>
                        <img
                            className={css.logo}
                            src={logoNew}
                            alt="DreamTeam logo"
                        />
                    </div>
                </div>
            </div>
            <Outlet />
        </Page>
    );
};