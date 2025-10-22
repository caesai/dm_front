import Popup from 'reactjs-popup';
import styled from 'styled-components';
import { FC, useEffect, useState } from 'react';
import css from './DeleteUserPopup.module.css';
import classNames from 'classnames';
// import './FeedbackPopup.css';
import { useAtom } from 'jotai';
import {authAtom, userAtom} from '@/atoms/userAtom.ts';
import {Toast} from "@/components/Toast/Toast.tsx";
import {APIDeleteUser} from "@/api/user.api.ts";
import {useNavigate} from "react-router-dom";


const StyledPopup = styled(Popup)`
    &-overlay {
        background: #58585869;
    }

    // use your custom style for ".popup-content"

    &-content {
        padding: 0;
        width: calc(100vw - 30px);
        border-radius: 12px;
    }
`;

interface Props {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
}

declare global {
    interface Window {
        Telegram: {
            WebApp: {
                close: () => void;
                initDataUnsafe: any;
            }
        };
    }
}

export const DeleteUserPopup: FC<Props> = (props) => {
    const close = () => props.setOpen(false);
    const navigate = useNavigate();
    const [isClosing, setIsClosing] = useState(false);
    const [authInfo, setAuth] = useAtom(authAtom);
    const [, setUser] = useAtom(userAtom);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastShow, setToastShow] = useState<boolean>(false);

    useEffect(() => {
        if (isClosing) {
            setTimeout(() => close(), 200);
        }
    }, [isClosing]);

    // hack to prevent from scrolling on page
    useEffect(() => {
        if (props.isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'scroll';
        }
        return () => {
            document.body.style.overflow = 'scroll';
        };
    }, [props]);


    useEffect(() => {
        if (props.isOpen) {
            setIsClosing(false);
        }
    }, [props.isOpen]);

    const deleteUser = () => {
        if (!authInfo?.access_token) {
            return;
        }
        // if (window.Telegram && window.Telegram.WebApp) {
        //         window.Telegram.WebApp.close();
        // }
        // return;
        APIDeleteUser(authInfo.access_token).then(() => {
            setAuth({
                access_token: '',
                expires_in: 0
            });
            setUser({
                administrator: null,
                id: 0,
                mailing_enabled: false,
                photo_url: null,
                telegram_id: 0,
                username: '',
                advertisement_agreement: false,
                allergies: [""],
                complete_onboarding: false,
                date_of_birth: "",
                early_access: false,
                email: "",
                first_name: "",
                gdpr_agreement: false,
                last_name: "",
                license_agreement: false,
                phone_number: ""
            })
            navigate('/onboarding');
            if (window.Telegram && window.Telegram.WebApp) {
                    window.Telegram.WebApp.close();
            }
        }).catch((err) => {
            if (err.response) {
                // alert(err.response.data);
                setToastMessage('Возникла ошибка: ' + err.response.data.message);
                setToastShow(true);
                setTimeout(function(){ setToastShow(false); setToastMessage(null); }, 3000);
            }
        });
    }

    return (
        <StyledPopup
            open={props.isOpen}
            onClose={close}
            closeOnDocumentClick={true}
            className={isClosing ? 'popupClose' : 'popup'}
        >
            <div
                className={classNames(
                    css.popup,
                    isClosing ? css.popup__closing : null
                )}
            >
                <span className={css.title}>Подтвердите удаление учетной записи</span>
                <span className={css.tags_title}>Все данные, связанные с ней, также будут удалены. Удалить учетную запись?</span>

                <button
                    className={classNames(
                        css.button, css.button__disabled
                    )}
                    onClick={deleteUser}
                >
                    Подтверждаю
                </button>
                <button
                    className={classNames(
                        css.button, css.button__disabled
                    )}
                    onClick={close}
                >
                    Отмена
                </button>
            </div>
            <Toast message={toastMessage} showClose={toastShow} />
        </StyledPopup>
    );
};
