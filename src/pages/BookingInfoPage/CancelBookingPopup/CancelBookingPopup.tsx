// CancelBookingPopup.tsx
import Popup from 'reactjs-popup';
import styled from 'styled-components';
import css from './CancelBookingPopup.module.css';
import React, { useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import { mockEventsUsersList } from '@/__mocks__/events.mock.ts';

// Reusable styled component for the popup.
const StyledPopup = styled(Popup)`
    &-overlay {
        background: #58585869;
        padding: 0 15px;
    }

    &-content {
        margin: 0;
        padding: 0;
        border-radius: 10px;
        width: calc(100vw - 30px);
        max-width: 340px;
    }
`;

// Defines the component's steps using a constant for clarity and easier management.
enum PopupStep {
    Confirmation,
    Reason,
    Success,
    Error,
}

// Props for the main component.
interface CancelBookingPopupProps {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
    onCancel: () => Promise<void>;
    onSendReason?: (reason: string) => Promise<void>;
    onSuccess: () => void;
    popupText: string;
    successMessage: string;
    skipStep?: boolean;
}

export const CancelBookingPopup: React.FC<CancelBookingPopupProps> = (
    {
        isOpen,
        setOpen,
        onCancel,
        onSuccess,
        onSendReason,
        popupText,
        successMessage,
        skipStep,
    },
) => {
    const [currentStep, setCurrentStep] = useState<PopupStep>(PopupStep.Confirmation);

    // Mocks the Telegram user ID for example purposes.
    const tg_id = window.Telegram.WebApp.initDataUnsafe?.user?.id;

    // Use useCallback for handler functions to prevent unnecessary re-renders.
    const closePopup = useCallback(() => {
        if (currentStep === PopupStep.Success) {
            onSuccess();
        }
        if (currentStep === PopupStep.Reason) {
            setCurrentStep(PopupStep.Success);
        } else {
            setCurrentStep(PopupStep.Confirmation);
            setOpen(false);
        }
    }, [currentStep, onSuccess, setOpen]);

    const handleCancelBooking = useCallback(async () => {
        try {
            await onCancel();

            const isKnownUser = tg_id && mockEventsUsersList.includes(tg_id);
            if (skipStep || !isKnownUser) {
                setCurrentStep(PopupStep.Success);
            } else {
                setCurrentStep(PopupStep.Reason);
            }
        } catch (error) {
            console.error('Error canceling booking:', error);
            setCurrentStep(PopupStep.Error);
        }
    }, [onCancel, tg_id, skipStep]);

    const handleSendReason = useCallback(async (reason: string) => {
        if (!onSendReason) return;
        try {
            await onSendReason(reason);
            setCurrentStep(PopupStep.Success);
        } catch (error) {
            console.error('Error sending reason:', error);
            setCurrentStep(PopupStep.Error);
        }
    }, [onSendReason]);

    const handleRetry = useCallback(() => {
        setCurrentStep(PopupStep.Confirmation);
    }, []);

    // Renders the appropriate component based on the current step.
    const renderStepContent = useMemo(() => {
        switch (currentStep) {
            case PopupStep.Confirmation:
                return (
                    <StepOne
                        popupText={popupText}
                        onCancelConfirm={handleCancelBooking}
                        onCancelClose={closePopup}
                    />
                );
            case PopupStep.Reason:
                return (
                    <StepTwo
                        onSendReason={handleSendReason}
                    />
                );
            case PopupStep.Success:
                return <StepThree successMessage={successMessage} />;
            case PopupStep.Error:
                return <ErrorStep onRetry={handleRetry} />;
            default:
                return null;
        }
    }, [
        currentStep,
        popupText,
        handleCancelBooking,
        closePopup,
        handleSendReason,
        successMessage,
        handleRetry,
    ]);

    return (
        <StyledPopup open={isOpen} onClose={closePopup}>
            <div className={css.popup}>
                <div className={css.end}>
                    <RoundedButton
                        icon={<CrossIcon size={44} color={'black'} />}
                        action={closePopup}
                    />
                </div>
                {renderStepContent}
            </div>
        </StyledPopup>
    );
};

// =======================
// Step Components
// =======================

interface StepOneProps {
    popupText: string;
    onCancelConfirm: () => void;
    onCancelClose: () => void;
}

const StepOne: React.FC<StepOneProps> = ({ popupText, onCancelConfirm, onCancelClose }) => {
    return (
        <>
            <span className={css.text}>{popupText}</span>
            <div className={css.buttons}>
                <UniversalButton width={'full'} title={'Нет'} action={onCancelClose} />
                <UniversalButton
                    width={'full'}
                    title={'Да'}
                    theme={'red'}
                    action={onCancelConfirm}
                />
            </div>
        </>
    );
};

interface StepTwoProps {
    onSendReason: (reason: string) => Promise<void>;
}

const StepTwo: React.FC<StepTwoProps> = ({ onSendReason }) => {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const reasons = [
        'Поменялись планы',
        'Решили пойти в другое место',
        'Забронировал(а) по ошибке',
    ];

    return (
        <>
            <span className={css.text}>{'Укажите причину отмены, пожалуйста'}</span>
            <div className={css.reasons}>
                {reasons.map((text, index) => (
                    <button
                        key={index}
                        className={classNames(css.reasonBtn, {
                            [css.active]: selectedReason === text,
                        })}
                        onClick={() => setSelectedReason(text)}
                    >
                        {text}
                    </button>
                ))}
            </div>
            <UniversalButton
                width={'full'}
                title={'Подтвердить'}
                theme={selectedReason ? 'red' : undefined}
                action={() => selectedReason && onSendReason(selectedReason)}
            />
        </>
    );
};

interface StepThreeProps {
    successMessage: string;
}

const StepThree: React.FC<StepThreeProps> = ({ successMessage }) => {
    return (
        <span className={css.text} style={{ marginBottom: 30 }}>
            {successMessage}
        </span>
    );
};

interface ErrorStepProps {
    onRetry: () => void;
}

const ErrorStep: React.FC<ErrorStepProps> = ({ onRetry }) => (
    <>
        <span className={css.text}>{'Произошла ошибка'}</span>
        <div className={css.buttons}>
            <UniversalButton width={'full'} title={'Попробовать снова'} action={onRetry} />
        </div>
    </>
);
