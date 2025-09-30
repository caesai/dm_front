import { Page } from '@/components/Page.tsx';
import css from './BanquetOptionPage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { useEffect, useState } from 'react';
import { CalendarPopup } from '@/pages/UserProfilePage/CalendarPopup/CalendarPopup.tsx';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { TimeInput } from '@/components/TimeInput/TimeInput.tsx';
import { TimeFromIcon } from '@/components/Icons/TimeFromIcon.tsx';
import { TimeToIcon } from '@/components/Icons/TimeToIcon.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { DropDownSelect } from '@/components/DropDownSelect/DropDownSelect.tsx';
import { CakeIcon } from '@/components/Icons/CakeIcon.tsx';
import { UsersIcon } from '@/components/Icons/UsersIcon';
import { BanquetOptionsPopup } from '@/components/BanquetOptionsPopup/BanquetOpitonsPopup.tsx';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
import classNames from 'classnames';
import { IBanquetParams } from '@/types/banquets.ts';
import { banquetParams } from '@/__mocks__/banquets.mock.ts';
import { TextInput } from '@/components/TextInput/TextInput.tsx';

export const BanquetOptionPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { restaurant_id } = useParams();

    const banquet = location.state?.banquet;

    const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
    const [date, setDate] = useState<Date | null>(null);
    const [timeFrom, setTimeFrom] = useState<string | undefined>();
    const [timeTo, setTimeTo] = useState<string | undefined>();
    const [isOpenPopup, setOpenPopup] = useState<boolean>(false);
    const [isOpenDropdown, setOpenDropdown] = useState<boolean>(false);
    const [currentBanquetParams, setCurrentBanquetParams] =
        useState<IBanquetParams>();
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [customReason, setCustomReason] = useState<string>('');

    const [guestCount, setGuestCount] = useState<PickerValueObj>({
        value: 'unset',
        title: '',
    });

    const closePopup = () => setOpenPopup(false);

    const goBack = () => {
        navigate(`/banquets/${restaurant_id}/choose`);
    };

    const handleReasonSelect = (reason: string) => {
        setSelectedReason(reason);
        setOpenDropdown(false);
        if (reason !== 'Другое') {
            setCustomReason('');
        }
    };

    const isFormValid =
        date !== null &&
        timeFrom &&
        timeTo &&
        guestCount.value !== 'unset' &&
        selectedReason !== '' &&
        (selectedReason !== 'Другое' || customReason !== '');

    const handleContinue = () => {
        const finalReason = selectedReason === 'Другое' ? customReason : selectedReason;
        const banquetData = {
            date,
            timeFrom,
            timeTo,
            guestCount,
            reason: finalReason,
            price: currentBanquetParams && guestCount.value !== 'unset' ? {
                deposit: currentBanquetParams.deposit_per_person,
                totalDeposit: currentBanquetParams.deposit_per_person * parseInt(guestCount.value),
                serviceFee: currentBanquetParams.service_fee,
                total: (1 + currentBanquetParams.service_fee / 100) *
                    currentBanquetParams.deposit_per_person *
                    parseInt(guestCount.value)
            } : null
        };

        navigate(`/banquets/${restaurant_id}/additional-services`, {
            state: banquetData
        });
    };


    useEffect(() => {
        if (!banquet) {
            navigate('/');
        }
    }, [banquet, navigate]);

    useEffect(() => {
        setCurrentBanquetParams(banquetParams);
    }, []);

    return (
        <Page back={true}>
            <BanquetOptionsPopup
                isOpen={isOpenPopup}
                closePopup={closePopup}
                guestCount={guestCount}
                setGuestCount={setGuestCount}
                minGuests={10}
                maxGuests={20}
            />
            <div className={css.page}>
                <CalendarPopup
                    isOpen={calendarOpen}
                    setIsOpen={setCalendarOpen}
                    initialDate={new Date()}
                    setDate={setDate}
                />
                <div className={css.pageWrapper}>
                    <div className={css.header}>
                        <RoundedButton
                            icon={<BackIcon color={'var(--dark-grey)'} />}
                            action={goBack}
                        ></RoundedButton>
                        <span className={css.header_title}>
                            {banquet?.name}
                        </span>
                        <div />
                    </div>
                    <ContentContainer>
                        <ContentBlock>
                            <div className={css.formContainer}>
                                <div
                                    className={css.datePicker}
                                    onClick={() => setCalendarOpen(true)}
                                >
                                    {date ? (
                                        <span>{date.toLocaleDateString()}</span>
                                    ) : (
                                        <span
                                            className={
                                                css.datePicker__placeholder
                                            }
                                        >
                                            Дата
                                        </span>
                                    )}

                                    <CalendarIcon
                                        size={20}
                                        color={'var(--grey)'}
                                    />
                                </div>
                                <div className={css.timeInputs}>
                                    <TimeInput
                                        placeholder={'Время с'}
                                        value={timeFrom}
                                        onChange={(e) => setTimeFrom(e)}
                                        icon={<TimeFromIcon size={24} />}
                                    />
                                    <TimeInput
                                        placeholder={'Время до'}
                                        value={timeTo}
                                        onChange={(e) => setTimeTo(e)}
                                        icon={<TimeToIcon size={24} />}
                                    />
                                </div>
                                <div
                                    className={css.guestCount}
                                    onClick={() => setOpenPopup(true)}
                                >
                                    <UsersIcon size={24} />
                                    {guestCount.value === 'unset' ? (
                                        <span
                                            className={
                                                css.guestCount__placeholder
                                            }
                                        >
                                            Количество гостей
                                        </span>
                                    ) : (
                                        <span>{guestCount.title}</span>
                                    )}
                                </div>
                                <div className={css.reasonContainer}>
                                    <DropDownSelect
                                        title={
                                            selectedReason
                                                ? selectedReason
                                                : 'Повод'
                                        }
                                        isValid={true}
                                        icon={<CakeIcon size={24} />}
                                        onClick={() =>
                                            setOpenDropdown(!isOpenDropdown)
                                        }
                                    />
                                    <div
                                        className={classNames(
                                            css.dropdown_content,
                                            isOpenDropdown
                                                ? css.dropdown_active
                                                : null
                                        )}
                                    >
                                        {currentBanquetParams?.banquetType.map(
                                            (type, i) => (
                                                <span
                                                    key={i}
                                                    className={
                                                        css.dropdown_item
                                                    }
                                                    onClick={() =>
                                                        handleReasonSelect(type)
                                                    }
                                                >
                                                    {type}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                                {/* Форма для ввода повода банкета, если выбрано "Другое" */}
                                {selectedReason === 'Другое' && (
                                    <TextInput
                                        placeholder={'Повод'}
                                        value={customReason}
                                        onChange={(e) => setCustomReason(e)}
                                    />
                                )}
                            </div>
                        </ContentBlock>
                        {isFormValid && (
                            <ContentBlock>
                                <div className={css.payment}>
                                    <span className={css.payment_title}>
                                        Предварительный рассчет стоимости:
                                    </span>
                                    <div className={css.payment_text}>
                                        <span>Депозит за человека:</span>
                                        <span>
                                            {
                                                currentBanquetParams?.deposit_per_person
                                            }{' '}
                                            ₽
                                        </span>
                                    </div>
                                    <div className={css.payment_text}>
                                        <span>Депозит итого:</span>
                                        <span>
                                            {currentBanquetParams &&
                                                guestCount.value !== 'unset' &&
                                                currentBanquetParams.deposit_per_person *
                                                    parseInt(guestCount.value) +
                                                    ' ₽'}
                                        </span>
                                    </div>
                                    <div className={css.payment_text}>
                                        <span>Сервисный сбор:</span>
                                        <span>
                                            {currentBanquetParams?.service_fee}%
                                        </span>
                                    </div>
                                    <div className={css.payment_text}>
                                        <span>Итого:</span>
                                        <span>
                                            {currentBanquetParams &&
                                                (1 +
                                                    currentBanquetParams?.service_fee /
                                                        100) *
                                                    currentBanquetParams?.deposit_per_person *
                                                    parseInt(guestCount.value) +
                                                    ' ₽'}
                                        </span>
                                    </div>
                                    <p>
                                        Конечная стоимость банкета формируется
                                        из подобранного меню, винного
                                        сопровождения, сервисного сбора, а также
                                        дополнительных услуг.
                                    </p>
                                </div>
                            </ContentBlock>
                        )}
                        <div className={css.button}>
                            <UniversalButton
                                width={'full'}
                                title={'Продолжить'}
                                theme={'red'}
                                action={handleContinue
                            }
                            />
                        </div>
                    </ContentContainer>
                </div>
            </div>
        </Page>
    );
};
