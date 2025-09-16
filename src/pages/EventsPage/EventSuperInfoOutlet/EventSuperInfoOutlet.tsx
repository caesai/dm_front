import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import css from './EventSuperInfoOutlet.module.css';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import classNames from 'classnames';
import { useAtom } from 'jotai/index';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import hh from '/img/hh.jpg';
import { APIGetSuperEventHasApplication, APIPostSuperEventCheckLink } from '@/api/events.ts';

export const EventSuperInfoOutlet: React.FC = () => {
    const navigate = useNavigate();
    const [hideAbout, setHideAbout] = useState(true);
    const [hasApplication, setHasApplication] = useState(false);
    const [user] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);

    const next = () => {
        if (user?.complete_onboarding) {
            navigate(`/events/super/apply`);
        } else {
            navigate(`/onboarding/5`);
        }
    };

    useEffect(() => {
        if (auth?.access_token) {
            APIPostSuperEventCheckLink(auth?.access_token).then();
            APIGetSuperEventHasApplication(auth?.access_token)
                .then((response) => {
                    setHasApplication(response.data.has_application);
                });
        }
    }, []);

    const description = 'Hospitality Heroes — ежеквартальное образовательное мероприятие Dreamteam, которое мы  делаем открытым для всех профессионалов индустрии гостеприимства.';
    return (
        <div className={css.content}>
                <div
                    className={css.event_img}
                    style={{
                        backgroundImage: `url(${hh})`,
                    }}
                />
            <div className={css.content_description}>
                <h2 className={css.content_description__title}>Hospitality Heroes</h2>

                <span className={classNames(
                    css.content_description__info,
                    hideAbout ? css.trimLines : null,
                )}>
                    {description.split(/\n|\r\n/).map((segment, index) => (
                        <>
                            {index > 0 && <br />}
                            {segment}
                        </>
                    ))}
                </span>
                {description.length > 100 &&
                    (
                        <div
                            className={css.trimLinesButton}
                            onClick={() => setHideAbout((prev) => !prev)}
                        >
                            <span className={css.text}>
                                {hideAbout ? 'Читать больше' : 'Скрыть'}
                            </span>
                        </div>
                    )
                }
            </div>
            <div className={css.event_params}>
                <div className={css.event_params_row}>
                    <div className={css.event_params_col}>
                        <span className={css.event_params_col__title}>
                            Дата
                        </span>
                        <span className={css.event_params_col__data}>
                            11.11.2025
                        </span>
                    </div>

                    <div className={css.event_params_col}>
                        <span className={css.event_params_col__title}>
                            Время
                        </span>
                        <span className={css.event_params_col__data}>
                            10:00
                        </span>
                    </div>
                </div>
                <div className={css.event_params_row}>
                    <div className={css.event_params_col}>
                        <span className={css.event_params_col__title}>
                            Адрес
                        </span>
                        <span className={css.event_params_col__data}>
                                Барочная улица, дом 4а, строение 1
                            </span>
                    </div>
                </div>
                <div className={css.event_params_row}>
                    <div className={css.event_params_col}>
                        <span className={css.event_params_col__title}>
                            Место
                        </span>
                        <span className={css.event_params_col__data}>
                            Левашовский хлебзавод
                        </span>
                    </div>
                </div>
                {hasApplication && (
                    <div className={css.event_params_row}>
                        <div className={css.event_params_col}>
                            <span className={css.event_params_col__title}>&#10003; Заявка на участие отправлена</span>
                        </div>
                    </div>
                )}
            </div>
            {!hasApplication && (
                <div className={css.absoluteBottom}>
                    <div className={css.bottomWrapper}>
                        <UniversalButton
                            width={'full'}
                            title={'Участвовать'}
                            theme={'red'}
                            action={next}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
