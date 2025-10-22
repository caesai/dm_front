import Popup from 'reactjs-popup';
import styled from 'styled-components';
import css from './CancelBookingPopup.module.css';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import React, { useState } from 'react';
import classNames from 'classnames';

import { APIPOSTCancelReason } from '@/api/restaurants.ts';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import { AxiosResponse } from 'axios';
import { useAtom } from 'jotai/index';
import { authAtom } from '@/atoms/userAtom.ts';
import { mockEventsUsersList } from '@/__mocks__/events.mock.ts';

const StyledPopup = styled(Popup)`
    &-overlay {
        background: #58585869;
        padding: 0 15px;
    }

    // use your custom style for ".popup-content"

    &-content {
        //background-color: transparent;
        margin: 0;
        padding: 0;
        border-radius: 10px;
        width: calc(100vw - 30px);
        max-width: 340px;
    }
`;

interface Props {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
    onCancelBooking: () => Promise<AxiosResponse<any, any>>;
    onSuccess: () => void;
    popupText: string;
    successMessage: string;
    skipStep?: boolean;
    bookingId?: number;
}

export const CancelBookingPopup = ({ isOpen, setOpen, onCancelBooking, popupText, successMessage, skipStep, bookingId, onSuccess }: Props) => {
    const [currentStep, setCurrentStep] = useState(0);
    const steps = [StepOne, StepTwo, StepThree, ErrorStep];
    const tg_id = window.Telegram.WebApp.initDataUnsafe.user.id;

    const cancelBooking = () => {
        onCancelBooking()
            .then(() => {
                if (skipStep || tg_id && !mockEventsUsersList.includes(tg_id)) {
                    setCurrentStep(2);
                    return;
                } else {
                    setCurrentStep((prev) => prev + 1);
                }
            })
            .catch((err) => {
                console.error(err);
                // Set Error Step Component
                setCurrentStep(3);
            });
    };

    const closePopup = () => {
        if (currentStep == 2) {
            onSuccess();
        }
        setCurrentStep(0);
        setOpen(false);
    }

    const handlePreviousStep = () => {
        setCurrentStep(0);
    };

    const CurrentStepComponent = steps[currentStep];

    return (
        <StyledPopup open={isOpen} onClose={closePopup}>
            <div className={css.popup}>
                <div className={css.end}>
                    <RoundedButton
                        icon={<CrossIcon size={44} color={'black'} />}
                        action={closePopup}
                    />
                </div>
                {CurrentStepComponent && (
                    <CurrentStepComponent
                        cancelBooking={cancelBooking}
                        closePopup={closePopup}
                        handlePreviousStep={handlePreviousStep}
                        successMessage={successMessage}
                        popupText={popupText}
                        bookingId={bookingId}
                        setCurrentStep={setCurrentStep}
                    />
                )}
            </div>
        </StyledPopup>
    );
};

interface StepOneProps {
    cancelBooking: () => void;
    closePopup: () => void;
    popupText: string;
}

const StepOne: React.FC<StepOneProps> = ({ cancelBooking, closePopup, popupText }) => {
    return (
        <>
            <span className={css.text}>
                {popupText}
            </span>
            <div className={css.buttons}>
                <UniversalButton
                    width={'full'}
                    title={'Нет'}
                    action={closePopup}
                />
                <UniversalButton
                    width={'full'}
                    title={'Да'}
                    theme={'red'}
                    action={cancelBooking}
                />
            </div>
        </>
    );
};

interface StepTwoProps {
    setCurrentStep: (step: number) => void;
    bookingId?: number;
}

const StepTwo: React.FC<StepTwoProps> = ({ bookingId, setCurrentStep }) => {
    const [auth] = useAtom(authAtom);
    const [reason, setReason] = React.useState<string | null>(null);
    const reasons = [
        'Поменялись планы',
        'Решили пойти в другое место',
        'Забронировал(а) по ошибке'
    ];
    const sendReason = () => {
        if (!reason || !auth?.access_token || !bookingId) return;
        APIPOSTCancelReason(auth?.access_token, bookingId, reason)
            .then(() => {
                setCurrentStep(2);
            })
            .catch((err) => {
                // Set Error Step Component
                console.error(err)
                setCurrentStep(3);
            });
    }
    return (
        <>
            <span className={css.text}>
                {'Укажите причину отмены, пожалуйста'}
            </span>
            <div className={css.reasons}>
                {reasons.map((text, index) => (
                    <button key={index} className={classNames(
                        css.reasonBtn,
                        reason === text ? css.active : null
                    )} onClick={() => setReason(text)}>
                        {text}
                    </button>
                ))}
            </div>
            <UniversalButton
                width={'full'}
                title={'Подтвердить'}
                theme={reason ? 'red' : undefined}
                action={sendReason}
            />
        </>
    )
}

interface StepThreeProps {
    successMessage: string;
}

const StepThree: React.FC<StepThreeProps> = ({ successMessage }) => {
    return (
        <>
            <span className={css.text} style={{ marginBottom: 30 }}>
                {successMessage}
            </span>
        </>
    )
}

interface ErrorStepProps {
    handlePreviousStep: () => void;
}

const ErrorStep: React.FC<ErrorStepProps> = ({ handlePreviousStep }) => (
    <>
        <span className={css.text}>
            {'Произошла ошибка'}
        </span>
        <div className={css.buttons}>
            <UniversalButton
                width={'full'}
                title={'Попробовать снова'}
                action={handlePreviousStep}
            />
        </div>
    </>
)
