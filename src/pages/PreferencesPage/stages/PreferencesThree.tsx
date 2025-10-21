import css from '../PreferencesPage.module.css';
import classNames from 'classnames';
import { CommentaryOptionButton } from '@/components/CommentaryOptionButton/CommentaryOptionButton.tsx';
import { eightStageOptions } from '@/__mocks__/preferences.mock.ts';
import React, { useState } from 'react';
import { useAtom } from 'jotai/index';
import { authAtom } from '@/atoms/userAtom.ts';
import { APIUserPreferences } from '@/api/user.ts';
import { useNavigate } from 'react-router-dom';

export const PreferencesThree: React.FC = () => {
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
                    category: 'events',
                    choices: preferences,
                }]

        })
            .then(() => localStorage.setItem("PREFERENCES_STATUS", JSON.stringify({ visit_number: 3, preferences_sent: true })))
            .then(() => navigate('/'))
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
                        Какие форматы <br/> вам интересны?
                    </h2>
                    <div className={css.stage_options_container}>
                        {eightStageOptions.map((item) => (
                            <CommentaryOptionButton
                                newDesign
                                text={item.content}
                                icon={item.icon}
                                active={preferences.includes(item.content)}
                                onClick={() => changePreference(item.content)}
                                key={item.content}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
