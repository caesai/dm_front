import {Page} from '@/components/Page.tsx';
import css from './PreferencesPage.module.css';
import classNames from 'classnames';
import {Outlet, useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {useEffect} from 'react';
import logoNew from "/img/DT_concierge_logo_color1.svg";
import classnames from 'classnames';
import { CloseIcon } from '@/components/Icons/CloseIcon.tsx';

export const PreferencesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();

    useEffect(() => {
        if (location.pathname == '/preferences') {
            navigate('/preferences/1');
        }
    }, [location]);


    const getCurrentPage = () => {
        const pg = location.pathname
            .replace('/preferences', '')
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
                                className={classNames(css.stage, css.stage_additional, {
                                    [css.stage__active]: checkIsPageActive(1),
                                })}
                                onClick={() => navigate('/preferences/1')}
                            ></div>
                            <div
                                className={classNames(css.stage, css.stage_additional, {
                                    [css.stage__active]: checkIsPageActive(2),
                                })}
                                onClick={() => navigate('/preferences/2')}
                            ></div>
                            <div
                                className={classNames(css.stage, css.stage_additional, {
                                    [css.stage__active]: checkIsPageActive(3),
                                })}
                                onClick={() => navigate('/preferences/3')}
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
                    <span className={classnames(css.closeIcon)} onClick={() => navigate('/')}>
                            <CloseIcon size={46} />
                    </span>
                </div>
            </div>
            <Outlet />
        </Page>
    );
};