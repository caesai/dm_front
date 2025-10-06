import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import css from './EventSuperApplyOutlet.module.css';
import { useNavigate } from 'react-router-dom';
import { useMemo, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { AppLoadingScreen } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
import { Toast } from '@/components/Toast/Toast.tsx';
import { APIPostSuperEventCreateApplication } from '@/api/events.ts';

export const EventSuperApplyOutlet = () => {
    const navigate = useNavigate();
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastShow, setToastShow] = useState<boolean>(false);
    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);
    const [userInfo, setUserInfo] = useState({
        name: `${user?.first_name}`,
        surname: '',
        phone: `${user?.phone_number}`,
        work_place: '',
        job_title: '',
        experience: '',
        visit_purpose: ''
    });
    const [loading, setLoading] = useState(false);
    const bookingBtn = useRef<HTMLDivElement>(null);

    const validate = useMemo(() => {
        return (
            userInfo.name !== '' &&
            userInfo.surname !== '' &&
            userInfo.phone !== '' &&
            userInfo.work_place !== '' &&
            userInfo.job_title !== '' &&
            userInfo.experience !== '' &&
            userInfo.visit_purpose !== '' &&
            auth?.access_token
        );
    }, [userInfo, auth]);

    const createApplication = () => {
        if (
            validate
        ) {
            setLoading(true);
            auth?.access_token && APIPostSuperEventCreateApplication(auth?.access_token, userInfo)
                .then((response) => {
                    if (response.data.success) {
                        navigate('/events/super');
                    }
                })
                .finally(() => {
                    setLoading(false);
                })
        } else {
            setToastMessage('Необходимо заполнить все поля');
            setToastShow(true);
            setTimeout(function(){ setToastShow(false); setToastMessage(null); }, 3000);
        }
    };

    if (loading) {
        return <AppLoadingScreen />;
    }
    return (
        <div>
            <div className={css.contentContainer}>
                <div className={css.contentItem}>
                    <div className={css.form}>
                        <TextInput
                            value={userInfo.name}
                            onChange={(e) =>
                                setUserInfo((p) => ({ ...p, name: e }))
                            }
                            placeholder={'Ваше имя'}
                        />
                        <TextInput
                            value={userInfo.surname}
                            onChange={(e) =>
                                setUserInfo((p) => ({ ...p, surname: e }))
                            }
                            placeholder={'Ваша фамилия'}
                        />
                        <TextInput
                            value={Number(userInfo.phone.charAt(0)) === 7 ? '+' + userInfo.phone : userInfo.phone}
                            onChange={(e) =>
                                setUserInfo((p) => ({ ...p, phone: e.replace('+', '') }))
                            }
                            placeholder={'Ваш контактный номер'}
                        />
                        <TextInput
                            value={userInfo.work_place}
                            onChange={(e) =>
                                setUserInfo((p) => ({ ...p, work_place: e }))
                            }
                            placeholder={'Ваше место работы (организация)'}
                        />
                        <TextInput
                            value={userInfo.job_title}
                            onChange={(e) =>
                                setUserInfo((p) => ({ ...p, job_title: e }))
                            }
                            placeholder={'Ваша должность'}
                        />
                        <TextInput
                            value={userInfo.experience}
                            onChange={(e) =>
                                setUserInfo((p) => ({ ...p, experience: e }))
                            }
                            placeholder={'Ваш опыт работы'}
                            onFocus={() => {
                                if(bookingBtn.current) {
                                    bookingBtn.current.style.position = 'relative';

                                }
                            }}
                            onBlur={() => {
                                if(bookingBtn.current) {
                                    bookingBtn.current.style.position = 'fixed';
                                }
                            }}
                        />
                        <TextInput
                            value={userInfo.visit_purpose}
                            onChange={(e) =>
                                setUserInfo((p) => ({ ...p, visit_purpose: e }))
                            }
                            placeholder={'Цель посещения ивента'}
                            onFocus={() => {
                                if(bookingBtn.current) {
                                    bookingBtn.current.style.position = 'relative';
                                    bookingBtn.current.style.marginBottom = '60px';
                                }
                            }}
                            onBlur={() => {
                                if(bookingBtn.current) {
                                    bookingBtn.current.style.position = 'fixed';
                                    bookingBtn.current.style.marginBottom = 'auto';
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className={css.absoluteBottom} ref={bookingBtn}>
                <div className={css.bottomWrapper}>
                    <UniversalButton
                        width={'full'}
                        title={'Подать заявку'}
                        theme={'red'}
                        action={createApplication}
                    />
                </div>
            </div>
            <Toast message={toastMessage} showClose={toastShow} />
        </div>
    );
};
