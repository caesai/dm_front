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

    const isMainOnboarding = () => {
        const currentPage = getCurrentPage();
        return currentPage >= 1 && currentPage <= 6;
    };

    const isAdditionalOnboarding = () => {
        const currentPage = getCurrentPage();
        return currentPage >= 7 && currentPage <= 9;
    };

    const renderMainProgress = () => (
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
                // onClick={() => navigate('/onboarding/6')}
            ></div>
        </div>
    );

    const renderAdditionalProgress = () => (
        <div className={css.stage_container}>
            <div
                className={classNames(css.stage, css.stage_additional, {
                    [css.stage__active]: checkIsPageActive(7),
                })}
                onClick={() => navigate('/onboarding/7')}
            ></div>
            <div
                className={classNames(css.stage, css.stage_additional, {
                    [css.stage__active]: checkIsPageActive(8),
                })}
                onClick={() => navigate('/onboarding/8')}
            ></div>
            <div
                className={classNames(css.stage, css.stage_additional, {
                    [css.stage__active]: checkIsPageActive(9),
                })}
                onClick={() => navigate('/onboarding/9')}
            ></div>
        </div>
    );

    return (
        <Page back={false}>
            <div className={classNames(css.header)}>
                <div className={css.header_wrapper}>
                    {params.get('eventId') ? null : (
                        <>
                            {isMainOnboarding() && renderMainProgress()}
                            {isAdditionalOnboarding() && renderAdditionalProgress()}
                        </>
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