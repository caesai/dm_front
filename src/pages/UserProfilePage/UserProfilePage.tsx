import React, { useEffect, useState } from 'react';
import css from './UserProfilePage.module.css';
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { CalendarPopup } from '@/pages/UserProfilePage/CalendarPopup/CalendarPopup.tsx';
import { useAtom } from 'jotai';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { APIUpdateUserInfo} from '@/api/user.api.ts';
import { mainButton } from '@telegram-apps/sdk-react';
import { Toast } from "@/components/Toast/Toast.tsx";
import { DeleteUserPopup } from "@/pages/ProfilePage/DeleteUserPopup/DeleteUserPopup.tsx";
import { CommentaryOptionButton } from '@/components/CommentaryOptionButton/CommentaryOptionButton.tsx';
import { allergiesOptions } from '@/__mocks__/allergies.mock.ts';
import { findOtherAllergies } from '@/utils.ts';
import { IUserUpdate } from '@/types/user.types.ts';

export const UserProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useAtom(userAtom);
    const [authInfo] = useAtom(authAtom);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastShow, setToastShow] = useState<boolean>(false);
    const [deletePopup, setDeletePopup] = useState(false);

    const [userInfo, setUserInfo] = useState<IUserUpdate>({
        first_name: user?.first_name ?? '',
        last_name: user?.last_name ?? '',
        phone_number: user?.phone_number,
        email: user?.email ?? '',
        allergies: user?.allergies ?? null
    });

    const setDobFromAPI = (dob: string | null | undefined) => {
        return dob ? new Date(dob) : undefined;
    };

    const [calendarOpen, setCalendarOpen] = useState(false);
    const [dob, setDob] = useState<Date | undefined>(
        setDobFromAPI(user?.date_of_birth)
    );

    const allergies: string[] = location.state?.allergies ?? [];

    useEffect(() => {
        if (mainButton.mount.isAvailable()) {
            mainButton.mount();
            mainButton.setParams({
                backgroundColor: '#F52A2D',
                hasShineEffect: false,
                isEnabled: true,
                isLoaderVisible: false,
                isVisible: true,
                text: 'Сохранить',
                textColor: '#ffffff',
            });
        }
        const removeListener = mainButton.onClick(updateUser);
        return () => {
            removeListener();
        };
    }, [userInfo, dob]);

    useEffect(() => {
        return () => {
            mainButton.setParams({ isVisible: false });
            mainButton.unmount();
        };
    }, []);

    useEffect(() => {
        if (allergies.length > 0) {
            setUserInfo((prev) => ({ ...prev, allergies }))
        }
    }, [allergies.length]);
    console.log('allergies: ', allergies);
    const setMainButtonLoader = (value: boolean) => {
        mainButton.setParams({
            isLoaderVisible: value,
        });
    };

    const updateUser = () => {
        if (!authInfo?.access_token) {
            return;
        }
        setMainButtonLoader(true);
        APIUpdateUserInfo(
            {
                ...userInfo,
                date_of_birth: dob?.toISOString().split('T')[0],
                allergies: allergies ?? userInfo.allergies,
            },
            authInfo.access_token
        )
            .then((res) => {
                setUser(res.data);
                setMainButtonLoader(false);
                setToastMessage('Изменения сохранены');
                setToastShow(true);
                setTimeout(function(){ setToastShow(false); setToastMessage(null);}, 3000);
            })
            .catch((err) => {
                if (err.response) {
                    setToastMessage('Возникла ошибка: ' + err.response.data)
                    setToastShow(true);
                    setTimeout(function(){ setToastShow(false); setToastMessage(null); }, 3000);
                }
            });
    };

    const openDeletePopup = () => {
        setDeletePopup(true);
    }

    const navigateToAllergies = () => {
        navigate('/me/allergies', { state: {
                allergies: userInfo.allergies && userInfo.allergies.length > 0 ? userInfo.allergies : null,
            }
        });
    }

    return (
        <Page back={true}>
            <div className={css.page}>
                <DeleteUserPopup isOpen={deletePopup} setOpen={setDeletePopup} />
                <CalendarPopup
                    isOpen={calendarOpen}
                    setIsOpen={setCalendarOpen}
                    setDate={setDob}
                    initialDate={dob}
                />
                <div className={css.header}>
                    <RoundedButton
                        icon={<BackIcon size={24} color={'var(--dark-grey)'} />}
                        action={() => navigate(-1)}
                    />
                    <span className={css.header_title}>Личные данные</span>
                    <div className={css.header_spacer} />
                </div>
                <div className={css.fields}>
                    <TextInput
                        value={userInfo.first_name}
                        onChange={(v) =>
                            setUserInfo((prev) => ({ ...prev, first_name: v }))
                        }
                        placeholder={'Имя'}
                    />
                    <TextInput
                        value={userInfo.last_name}
                        onChange={(v) =>
                            setUserInfo((prev) => ({ ...prev, last_name: v }))
                        }
                        placeholder={'Фамилия'}
                    />
                    <TextInput
                        value={userInfo.phone_number}
                        onChange={(v) =>
                            setUserInfo((prev) => ({
                                ...prev,
                                phone_number: v,
                            }))
                        }
                        placeholder={'Номер телефона'}
                    />
                    <TextInput
                        value={String(userInfo.email)}
                        onChange={(v) =>
                            setUserInfo((prev) => ({ ...prev, email: v }))
                        }
                        placeholder={'Email'}
                    />
                    <div
                        className={css.datePicker}
                        onClick={() => setCalendarOpen(true)}
                    >
                        {!dob && (
                            <span className={css.datePicker__placeholder}>
                                Дата рождения
                            </span>
                        )}
                        <span>{dob?.toLocaleDateString()}</span>

                        <CalendarIcon size={20} color={'var(--grey)'} />
                    </div>
                    <div onClick={navigateToAllergies} className={css.allergy}>
                        <span>Аллергии</span>
                        {userInfo.allergies && userInfo.allergies.length > 0 &&
                            (
                                <div className={css.allergyOptions} >
                                    {allergiesOptions.filter(option =>
                                        userInfo.allergies && userInfo.allergies.includes(option.content),
                                    ).map((item, index) => (
                                        <CommentaryOptionButton
                                            newDesign
                                            text={item.content}
                                            icon={item.icon}
                                            active={true}
                                            style={{
                                                fontSize: 10,
                                                padding: '5px 8px',
                                                backgroundColor: '#fff',
                                                borderColor: '#fff',
                                            }}
                                            key={index}
                                        />
                                    ))}
                                    {findOtherAllergies(userInfo.allergies).length > 0 &&
                                        findOtherAllergies(userInfo.allergies)
                                            .map((allergy, index) => (
                                                <CommentaryOptionButton
                                                    newDesign
                                                    text={allergy}
                                                    icon={'❌'}
                                                    active={true}
                                                    style={{
                                                        fontSize: 10,
                                                        padding: '5px 8px',
                                                        backgroundColor: '#fff',
                                                        borderColor: '#fff',
                                                    }}
                                                    key={index}
                                                />
                                            ))}
                                </div>
                            )}
                    </div>
                    <div
                        className={css.delete}
                        onClick={openDeletePopup}
                    >
                        <span className={css.delete}>
                            Удалить учетную запись
                        </span>
                    </div>
                </div>
            </div>
            <Toast message={toastMessage} showClose={toastShow} />
        </Page>
    );
};
