import css from '../OnboardingPage.module.css';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { CommentaryOptionButton } from '@/components/CommentaryOptionButton/CommentaryOptionButton.tsx';
import { sevenStageOptions } from '@/__mocks__/onboarding.mock.ts';
import { useState } from 'react';
import { useAtom } from 'jotai/index';
import { authAtom } from '@/atoms/userAtom.ts';
import { APIUserPreferences } from '@/api/user.ts';

export const StageEight = () => {
    const navigate = useNavigate();

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
                    category: 'menu',
                    choices: preferences,
                }]

        })
            .then(() => navigate('/onboarding/9'))
            .catch(() => alert
                (
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
                        Что вас особенно <br/>
                        привлекает в меню?
                    </h2>
                    <div className={css.stage_options_container}>
                        {sevenStageOptions.map((item) => (
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
