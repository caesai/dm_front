import css from '../OnboardingPage.module.css';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { CommentaryOptionButton } from '@/components/CommentaryOptionButton/CommentaryOptionButton.tsx';
import { eightStageOptions } from '@/__mocks__/onboarding.mock.ts';
import { useState } from 'react';
import { useAtom } from 'jotai/index';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { APICompleteOnboarding, APIUserPreferences } from '@/api/user.ts';
import { getDataFromLocalStorage, removeDataFromLocalStorage } from '@/utils.ts';

export const StageNine = () => {
    const navigate = useNavigate();

    const [, setUser] = useAtom(userAtom);
    const [auth] = useAtom(authAtom);

    const [preferences, setPreferences] = useState<string[]>([]);

    const changePreference = (content: string) => {
        if (preferences.includes(content)) {
            setPreferences(prev => (prev.filter((p) => p !== content)));
        }
        else {
            setPreferences([...preferences, content]);
        }
    }

    const handleContinue = () => {
        if (!auth?.access_token || preferences.length === 0 ) {
            return;
        }

        APIUserPreferences(auth.access_token, {
            preferences: [{
                    category: 'events',
                    choices: preferences,
                }]

        }).catch(() => alert
                (
                    'При сохранении данных произошла ошибка, пожалуйста, попробуйте перезапустить приложение.'
                )
            );

        APICompleteOnboarding(auth.access_token, true)
            .then((d) => setUser(d.data))
            .then(() => {
                const sharedEvent = getDataFromLocalStorage('sharedEvent');
                const superEvent = getDataFromLocalStorage('superEvent');
                const sharedRestaurant = getDataFromLocalStorage('sharedRestaurant');
                if(sharedEvent) {
                    navigate(`/events/${JSON.parse(sharedEvent).eventName}/restaurant/${JSON.parse(sharedEvent).resId}/confirm`);
                } else if (superEvent) {
                    navigate('/events/super');
                    removeDataFromLocalStorage('superEvent');
                } else if (sharedRestaurant) {
                    navigate('/restaurant/' + JSON.parse(sharedRestaurant).id);
                    removeDataFromLocalStorage('sharedRestaurant');
                } else {
                    navigate('/');
                }
            })
            .catch(() =>
                alert(
                    'При сохранении данных произошла ошибка, пожалуйста, попробуйте перезапустить приложение.'
                )
            );
    }

    return (
        <div className={css.stage_page}>
            <div className={css.stage_page_wrapper}>
                <div className={css.stage_footer}>
                    <div className={css.button_container}>
                        <div
                            className={classNames(css.redButton, {
                                [css.redButton__disabled]: preferences.length === 0,
                            })}
                            onClick={handleContinue}
                        >
                            <span>Продолжить</span>
                        </div>
                    </div>
                </div>
                <div className={css.stageSeven_wrapper}>
                    <h2 className={css.stage_description_title}>
                        Какие форматы <br/> вам интересны?
                    </h2>
                    <div className={css.stage_options_container}>
                        {eightStageOptions.map((item) => (
                            <CommentaryOptionButton
                                text={item.content}
                                icon={item.icon}
                                style={{backgroundColor: '#FFFFFF'}}
                                active={preferences.includes(item.content)}
                                onClick={() => changePreference(item.content)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
