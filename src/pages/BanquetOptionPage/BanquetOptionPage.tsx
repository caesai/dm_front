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
import { IBanquetAdditionalOptions, IBanquetOptions } from '@/types/banquets.ts';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { TimeSelectorPopup } from '@/components/TimeSelectorPopup/TimeSelectorPopup.tsx';

const timeToHours = (timeStr: string): number => {
    if (!timeStr || timeStr === 'с' || timeStr === 'до') return 0;
    return parseInt(timeStr.split(':')[0]);
};

const isTimeValid = (from: string, to: string): boolean => {
    const fromHours = timeToHours(from);
    const toHours = timeToHours(to);

    if (fromHours === 0 || toHours === 0) return true;
    return toHours - fromHours >= 1;
};

const banquetType = ['День рождения', 'Свадьба', 'Важный повод', 'Корпоратив', 'Другое'];

export const BanquetOptionPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const banquet: IBanquetOptions = location.state?.banquet;
    const restaurant_title = location.state?.restaurant_title;
    const additional_options: IBanquetAdditionalOptions[] = location.state?.additional_options;
    console.log('restaurant_title: ', restaurant_title);
    const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
    const [date, setDate] = useState<Date | null>(null);
    const [isOpenPopup, setOpenPopup] = useState<boolean>(false);
    const [isOpenDropdown, setOpenDropdown] = useState<boolean>(false);

    const [selectedReason, setSelectedReason] = useState<string>('');
    const [customReason, setCustomReason] = useState<string>('');
    const [isTimeToPopup, setTimeToPopup] = useState<boolean>(false);
    const [isTimeFromPopup, setTimeFromPopup] = useState<boolean>(false);

    const [guestCount, setGuestCount] = useState<PickerValueObj>({
        value: 'unset',
        title: '',
    });
    const [timeFrom, setTimeFrom] = useState<PickerValueObj>({
        value: 'с',
        title: '',
    });
    const [timeTo, setTimeTo] = useState<PickerValueObj>({
        value: 'до',
        title: '',
    });

    const closePopup = () => setOpenPopup(false);
    const closeTimeFromPopup = () => setTimeFromPopup(false);
    const closeTimeToPopup = () => setTimeToPopup(false);
    const goBack = () => {
        navigate(-1);
    };

    const handleReasonSelect = (reason: string) => {
        setSelectedReason(reason);
        setOpenDropdown(false);
        if (reason !== 'Другое') {
            setCustomReason('');
        }
    };

    const isTimeRangeValid = isTimeValid(timeFrom.value, timeTo.value);

    const isFormValid =
        date !== null &&
        timeFrom.value !== 'с' &&
        timeTo.value !== 'до' &&
        isTimeRangeValid &&
        guestCount.value !== 'unset' &&
        selectedReason !== '' &&
        (selectedReason !== 'Другое' || customReason !== '');

    const handleContinue = () => {
        const finalReason = selectedReason === 'Другое' ? customReason : selectedReason;
        const banquetData = {
            name: banquet.name,
            date,
            timeFrom: timeFrom.value,
            timeTo: timeTo.value,
            guestCount,
            additionalOptions: additional_options,
            restaurant_title,
            reason: finalReason,
            price: guestCount.value !== 'unset' ? {
                deposit: banquet.deposit,
                totalDeposit: Number(banquet.deposit) * parseInt(guestCount.value),
                serviceFee: banquet.service_fee,
                total: (1 + banquet.service_fee / 100) *
                    Number(banquet.deposit) *
                    parseInt(guestCount.value),
            } : null,
        };
        if (banquetData.additionalOptions && banquetData.additionalOptions.length > 0) {
            navigate(`/banquets/${id}/additional-services`, {
                state: banquetData,
            });
        } else {
            navigate(`/banquets/${id}/reservation`, {
                state: banquetData,
            });
        }
    };

    useEffect(() => {
        if (!banquet) {
            navigate('/');
        }
    }, [banquet, navigate]);

    return (
        <Page back={true}>
            <BanquetOptionsPopup
                isOpen={isOpenPopup}
                closePopup={closePopup}
                guestCount={guestCount}
                setGuestCount={setGuestCount}
                minGuests={Number(banquet.guests_min)}
                maxGuests={banquet.guests_max}
            />
            <TimeSelectorPopup
                isOpen={isTimeFromPopup}
                closePopup={closeTimeFromPopup}
                time={timeFrom}
                setTimeOption={setTimeFrom}
                maxTime={timeTo.value !== 'до' ? timeTo.value : undefined}
            />
            <TimeSelectorPopup
                isOpen={isTimeToPopup}
                closePopup={closeTimeToPopup}
                time={timeTo}
                setTimeOption={setTimeTo}
                minTime={timeFrom.value !== 'от' ? timeFrom.value : undefined}
            />
            <div className={css.page}>
                <CalendarPopup
                    isOpen={calendarOpen}
                    setIsOpen={setCalendarOpen}
                    initialDate={new Date()}
                    setDate={(date) => {
                        setDate(date);
                        setCalendarOpen(false);
                    }}
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
                        <div style={{ width: 40}}/>
                    </div>
                    <ContentContainer>
                        <ContentBlock>
                            <div className={css.formContainer}>
                                <div
                                    className={css.datePicker}
                                    onClick={() => setCalendarOpen(true)}
                                >
                                    <CalendarIcon
                                        size={20}
                                    />
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
                                </div>
                                <div className={css.timeInputs}>
                                    <TimeInput
                                        value={timeFrom.value}
                                        onClick={() => setTimeFromPopup(true)}
                                        icon={<TimeFromIcon size={24} />}
                                    />
                                    <TimeInput
                                        value={timeTo.value}
                                        onClick={() => setTimeToPopup(true)}
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
                                        textStyle={{fontWeight: '700'}}
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
                                        {banquetType.map(
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
                        {isFormValid && banquet.deposit !== null && (
                            <ContentBlock>
                                <div className={css.payment}>
                                    <span className={css.payment_title}>
                                        Предварительная стоимость*:
                                    </span>
                                    <div className={css.payment_text}>
                                        <span>Депозит за человека:</span>
                                        <span>
                                            {
                                                banquet?.deposit
                                            }{' '}
                                            ₽
                                        </span>
                                    </div>
                                    <div className={css.payment_text}>
                                        <span>Депозит итого:</span>
                                        <span>
                                            {banquet &&
                                                guestCount.value !== 'unset' &&
                                                Number(banquet.deposit) *
                                                parseInt(guestCount.value) +
                                                ' ₽'}
                                        </span>
                                    </div>
                                    <div className={css.payment_text}>
                                        <span>Сервисный сбор:</span>
                                        <span>
                                            {banquet?.service_fee}%
                                        </span>
                                    </div>
                                    <div className={css.payment_text}>
                                        <span>Итого:</span>
                                        <span>
                                            {banquet &&
                                                ((1 +
                                                        banquet?.service_fee /
                                                        100) *
                                                    Number(banquet?.deposit) *
                                                    parseInt(guestCount.value)) + ' ₽'
                                            }
                                        </span>
                                    </div>
                                    <p>
                                        *Окончательная стоимость банкета будет определена после того,
                                        как вы сформируете запрос,
                                        и мы свяжемся с вами для уточнения всех деталей мероприятия.
                                    </p>
                                </div>
                            </ContentBlock>
                        )}
                    </ContentContainer>
                </div>
                <div className={css.button}>
                    <UniversalButton
                        width={'full'}
                        title={'Продолжить'}
                        theme={isFormValid ? 'red' : undefined}
                        action={isFormValid ? handleContinue : undefined}
                    />
                </div>
            </div>
        </Page>
    );
};
