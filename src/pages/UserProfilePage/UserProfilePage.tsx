import css from './UserProfilePage.module.css';
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useNavigate } from 'react-router-dom';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { useEffect, useState } from 'react';
import { CalendarPopup } from '@/pages/UserProfilePage/CalendarPopup/CalendarPopup.tsx';
import { useAtom } from 'jotai';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { APIUpdateUserInfo } from '@/api/user.ts';
import { mainButton } from '@telegram-apps/sdk-react';

interface IUserInfo {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
    allergies?: string;
}

export const UserProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useAtom(userAtom);
    const [authInfo] = useAtom(authAtom);

    const [userInfo, setUserInfo] = useState<IUserInfo>({
        first_name: user?.first_name,
        last_name: user?.last_name,
        phone_number: user?.phone_number,
        email: user?.email,
        allergies: user?.allergies,
    });

    const setDobFromAPI = (dob: string | undefined) => {
        return dob ? new Date(dob) : undefined;
    };

    const [calendarOpen, setCalendarOpen] = useState(false);
    const [dob, setDob] = useState<Date | undefined>(
        setDobFromAPI(user?.date_of_birth)
    );

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

        const removeListener = mainButton.onClick(() => updateUser());

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

    const setMainButtonLoader = (value: boolean) => {
        mainButton.setParams({
            isLoaderVisible: value,
        });
    };

    const updateUser = () => {
        console.log(userInfo);
        if (!authInfo?.access_token) {
            return;
        }
        setMainButtonLoader(true);
        APIUpdateUserInfo(
            {
                ...userInfo,
                date_of_birth: dob?.toISOString().split('T')[0],
            },
            authInfo.access_token
        )
            .then((res) => {
                setUser(res.data);
                setMainButtonLoader(false);
            })
            .catch((err) => {
                if (err.response) {
                    alert(err.response.data);
                }
            });
    };

    return (
        <Page back={true}>
            <div className={css.page}>
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
                        value={userInfo.email}
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
                    <TextInput
                        value={userInfo.allergies}
                        onChange={(v) =>
                            setUserInfo((prev) => ({ ...prev, allergies: v }))
                        }
                        placeholder={'Аллергия'}
                    />
                </div>
            </div>
        </Page>
    );
};
