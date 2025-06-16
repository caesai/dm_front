import Popup from 'reactjs-popup';
import styled from 'styled-components';
import { FC, useEffect, useState } from 'react';
import css from './DeleteUserPopup.module.css';
import classNames from 'classnames';
// import './FeedbackPopup.css';
import { useAtom } from 'jotai';
import {authAtom, userAtom} from '@/atoms/userAtom.ts';
import {Toast} from "@/components/Toast/Toast.tsx";
import {APIDeleteUser} from "@/api/user.ts";


const StyledPopup = styled(Popup)`
    &-overlay {
    }

    &-content {
        position: absolute !important;
        bottom: 0;
        width: 100vw;
        padding: 0;
        animation: slideUp 0.2s ease-out forwards;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }
`;

interface Props {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
}

export const DeleteUserPopup: FC<Props> = (props) => {
    const close = () => props.setOpen(false);
    const [isClosing, setIsClosing] = useState(false);
    const [authInfo, setAuth] = useAtom(authAtom);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastShow, setToastShow] = useState<boolean>(false);
    const [, setUser] = useAtom(userAtom);

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
            console.log('isOpen');
            setIsClosing(false);
        }
    }, [props.isOpen]);

    const deleteUser = () => {
        if (!authInfo?.access_token) {
            return;
        }
        APIDeleteUser(authInfo.access_token).then((res) => {
            console.log('response: ', res);
            setAuth({
                access_token: "",
                expires_in: 0
            });
        }).catch((err) => {
            if (err.response) {
                // alert(err.response.data);
                setToastMessage('Возникла ошибка: ' + err.response.data)
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
                <span className={css.title}>Подвтердите удаление учетной записи</span>
                <span className={css.tags_title}>Все данные, связанные с ней, также будут удалены. Удалить учетную запись?</span>

                <button
                    className={classNames(
                        css.button,
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
