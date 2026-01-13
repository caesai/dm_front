/**
 * @fileoverview Страница настройки параметров банкета.
 * 
 * Третий шаг в процессе бронирования банкета:
 * 1. BanquetAddressPage (выбор ресторана)
 * 2. ChooseBanquetOptionsPage (выбор опции банкета)
 * 3. BanquetOptionPage (настройка банкета) <- текущая страница
 * 4. BanquetAdditionalServicesPage (дополнительные услуги) - опционально
 * 5. BanquetReservationPage (подтверждение)
 * 
 * Функциональность страницы:
 * - Выбор даты банкета (CalendarPopup)
 * - Выбор времени начала и окончания (TimeSelectorPopup)
 * - Выбор количества гостей (BanquetOptionsPopup)
 * - Выбор повода банкета (День рождения, Свадьба, Корпоратив, Другое)
 * - Отображение предварительной стоимости при валидной форме
 * - Сохранение данных в banquetFormAtom через useBanquetForm hook
 * 
 * Валидация формы:
 * - Все поля обязательны для заполнения
 * - Время окончания должно быть минимум на 1 час больше времени начала
 * - При выборе "Другое" обязателен ввод кастомного повода
 * 
 * @module pages/BanquetOptionPage
 * 
 * @see {@link ChooseBanquetOptionsPage} - предыдущий шаг (выбор опции)
 * @see {@link BanquetAdditionalServicesPage} - следующий шаг (дополнительные услуги)
 * @see {@link BanquetReservationPage} - альтернативный следующий шаг (без доп. услуг)
 * @see {@link useBanquetForm} - хук управления данными банкета
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';
import moment from 'moment';
// Types
import { IBanquet, IBanquetAdditionalOptions, IBanquetOptions } from '@/types/banquets.types.ts';
import { IRestaurant, IWorkTime } from '@/types/restaurant.types.ts';
// Atoms
import { useGetRestaurantById } from '@/atoms/restaurantsListAtom.ts';
// Hooks
import { useBanquetForm } from '@/hooks/useBanquetForm.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { CalendarPopup } from '@/pages/UserProfilePage/CalendarPopup/CalendarPopup.tsx';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { TimeInput } from '@/components/TimeInput/TimeInput.tsx';
import { TimeFromIcon } from '@/components/Icons/TimeFromIcon.tsx';
import { TimeToIcon } from '@/components/Icons/TimeToIcon.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { DropDownSelect } from '@/components/DropDownSelect/DropDownSelect.tsx';
import { CakeIcon } from '@/components/Icons/CakeIcon.tsx';
import { UsersIcon } from '@/components/Icons/UsersIcon.tsx';
import { BanquetOptionsPopup } from '@/components/BanquetOptionsPopup/BanquetOpitonsPopup.tsx';
import { PickerValue } from '@/lib/react-mobile-picker/components/Picker.tsx';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { TimeSelectorPopup } from '@/components/TimeSelectorPopup/TimeSelectorPopup.tsx';
// Styles
import css from '@/pages/BanquetOptionPage/BanquetOptionPage.module.css';

/**
 * Преобразует строку времени в число часов.
 * @param {string} timeStr - Строка времени.
 * @returns {number} - Число часов.
 */
const timeToHours = (timeStr: string): number => {
    if (!timeStr || timeStr === 'с' || timeStr === 'до') return 0;
    return parseInt(timeStr.split(':')[0]);
};

/**
 * Проверяет, является ли время валидным.
 * @param {string} from - Время начала.
 * @param {string} to - Время конца.
 * @returns {boolean} - true, если время валидно, false в противном случае.
 */
const isTimeValid = (from: string, to: string): boolean => {
    const fromHours = timeToHours(from);
    const toHours = timeToHours(to);

    if (fromHours === 0 || toHours === 0) return true;
    return toHours - fromHours >= 1;
};

/**
 * Доступные типы/поводы банкета.
 * При выборе "Другое" появляется текстовое поле для ввода кастомного повода.
 * @constant
 */
const banquetType: string[] = ['День рождения', 'Свадьба', 'Корпоратив', 'Другое'];

/**
 * Страница настройки параметров банкета.
 * 
 * Позволяет пользователю настроить все параметры выбранной банкетной опции:
 * дату, время, количество гостей и повод. При валидной форме отображает
 * предварительную стоимость и позволяет перейти к следующему шагу.
 * 
 * @returns {JSX.Element} - Компонент страницы настройки банкета
 * 
 * @example
 * // URL: /banquets/:restaurantId/option/:optionId
 * // Загружает опцию по optionId из restaurant.banquets.banquet_options
 */
export const BanquetOptionPage: React.FC = (): JSX.Element => {
    const navigate = useNavigate();
    const location = useLocation();
    const { restaurantId, optionId } = useParams();
    const { handlers: banquetHandlers } = useBanquetForm();
    const restaurant: IRestaurant | undefined = useGetRestaurantById(restaurantId || '');
    
    /** Данные банкета текущего ресторана */
    const banquet: IBanquet | undefined = useMemo(() => {
        return restaurant?.banquets || undefined;
    }, [restaurant]);
    
    /** Выбранная банкетная опция по optionId из URL */
    const banquetOption: IBanquetOptions | undefined = useMemo(() => {
        return banquet?.banquet_options.find((option: IBanquetOptions) => option.id === Number(optionId));
    }, [banquet, optionId]);
    
    /** Часы работы ресторана для валидации времени */
    const workTime: IWorkTime[] = useMemo(() => {
        return restaurant?.worktime || [];
    }, [restaurant]);
    
    /** Дополнительные услуги банкета */
    const additionalOptions: IBanquetAdditionalOptions[] = useMemo(() => {
        return banquet?.additional_options || [];
    }, [banquet]);

    // ============================================
    // Состояния UI
    // ============================================
    
    /** Флаг открытия календаря */
    const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
    /** Выбранная дата банкета */
    const [date, setDate] = useState<Date | null>(null);
    /** Флаг открытия popup выбора гостей */
    const [isOpenPopup, setOpenPopup] = useState<boolean>(false);
    /** Флаг открытия dropdown выбора повода */
    const [isOpenDropdown, setOpenDropdown] = useState<boolean>(false);

    /** Выбранный повод банкета */
    const [selectedReason, setSelectedReason] = useState<string>('');
    /** Кастомный повод (при выборе "Другое") */
    const [customReason, setCustomReason] = useState<string>('');
    /** Флаг открытия popup выбора времени окончания */
    const [isTimeToPopup, setTimeToPopup] = useState<boolean>(false);
    /** Флаг открытия popup выбора времени начала */
    const [isTimeFromPopup, setTimeFromPopup] = useState<boolean>(false);

    /** Количество гостей */
    const [guestCount, setGuestCount] = useState<PickerValue>({
        value: 'unset',
        title: '',
    });
    /** Время начала банкета */
    const [timeFrom, setTimeFrom] = useState<PickerValue>({
        value: 'с',
        title: '',
    });
    /** Время окончания банкета */
    const [timeTo, setTimeTo] = useState<PickerValue>({
        value: 'до',
        title: '',
    });

    // ============================================
    // Обработчики событий
    // ============================================
    
    /** Закрывает popup выбора гостей */
    const closePopup = () => setOpenPopup(false);
    /** Закрывает popup времени начала */
    const closeTimeFromPopup = () => setTimeFromPopup(false);
    /** Закрывает popup времени окончания */
    const closeTimeToPopup = () => setTimeToPopup(false);
    
    /**
     * Навигация назад на страницу выбора опций.
     * Сохраняет state для возможности восстановления данных.
     */
    const goBack = () => {
        navigate(`/banquets/${restaurantId}/choose`, { state: {...location.state}});
    };

    /**
     * Обрабатывает выбор повода банкета.
     * При выборе не "Другое" очищает кастомный повод.
     * 
     * @param reason - Выбранный повод
     */
    const handleReasonSelect = (reason: string) => {
        setSelectedReason(reason);
        setOpenDropdown(false);
        if (reason !== 'Другое') {
            setCustomReason('');
        }
    };

    /**
     * Вычисляет итоговую стоимость банкета.
     * Формула: (1 + service_fee/100) * deposit * guests_count
     * 
     * @returns Итоговая стоимость (округлённая)
     */
    const getTotalPrice = () => {
        return Math.round((1 + (banquetOption?.service_fee || 0) / 100) *
            Number(banquetOption?.deposit || 0) *
            parseInt(guestCount.value as string))
    }

    // ============================================
    // Валидация формы
    // ============================================
    
    /** Проверка валидности временного диапазона */
    const isTimeRangeValid = isTimeValid(timeFrom.value as string, timeTo.value as string);

    /**
     * Форма считается валидной когда:
     * - Выбрана дата
     * - Выбрано время начала и окончания
     * - Временной диапазон валиден (окончание > начала минимум на 1 час)
     * - Выбрано количество гостей
     * - Выбран повод (или введён кастомный при "Другое")
     */
    const isFormValid =
        date !== null &&
        timeFrom.value !== 'с' &&
        timeTo.value !== 'до' &&
        isTimeRangeValid &&
        guestCount.value !== 'unset' &&
        selectedReason !== '' &&
        (selectedReason !== 'Другое' || customReason !== '');

    /**
     * Обрабатывает нажатие кнопки "Продолжить".
     * 
     * Действия:
     * 1. Формирует финальный повод (кастомный или выбранный из списка)
     * 2. Сохраняет все данные формы в banquetFormAtom через useBanquetForm
     * 3. Навигирует на следующую страницу:
     *    - BanquetAdditionalServicesPage если есть дополнительные услуги
     *    - BanquetReservationPage если дополнительных услуг нет
     * 
     * @remarks
     * Навигация выполняется напрямую с использованием локальных переменных,
     * а не через navigateToNextPage(), чтобы избежать race condition:
     * setBanquetData обновляет атом асинхронно, и navigateToNextPage
     * мог бы использовать старые значения form до обновления.
     */
    const handleContinue = () => {
        const finalReason = selectedReason === 'Другое' ? customReason : selectedReason;
        
        // Сохраняем данные в атом
        banquetHandlers.setBanquetData({
            name: banquetOption?.name,
            date,
            timeFrom: timeFrom.value as string,
            timeTo: timeTo.value as string,
            guestCount,
            reason: finalReason,
            currentRestaurant: restaurant,
            restaurantId: restaurantId || '',
            optionId: optionId || '',
            additionalOptions: additionalOptions,
            withAdditionalPage: false,
            price: guestCount.value !== 'unset' ? {
                deposit: banquetOption?.deposit ?? null,
                totalDeposit: Number(banquetOption?.deposit) * parseInt(guestCount.value as string),
                serviceFee: banquetOption?.service_fee ?? 0,
                total: getTotalPrice(),
            } : null,
        });
        
        // Навигация на следующую страницу
        // Используем локальные переменные напрямую, чтобы избежать race condition
        // с асинхронным обновлением атома
        if (additionalOptions && additionalOptions.length > 0) {
            navigate(`/banquets/${restaurantId}/additional-services/${optionId}`);
        } else {
            navigate(`/banquets/${restaurantId}/reservation`);
        }
    };
    useEffect(() => {
        if (!banquetOption) {
            navigate('/');
        }
    }, [banquetOption, navigate]);

    useEffect(() => {
        const banquetData = location.state?.banquetData;
        if (banquetData) {
            setDate(new Date(banquetData.date));
            setTimeFrom({
                value: banquetData.timeFrom,
                title: banquetData.timeFrom,
            });
            setTimeTo({
                value: banquetData.timeTo,
                title: banquetData.timeTo,
            });
            setGuestCount(banquetData.guestCount);
            handleReasonSelect(banquetData.reason);
        }
    }, [location.state]);

    // ============================================
    // Вспомогательные функции для времени
    // ============================================
    
    /**
     * Вычитает 1 час из времени.
     * @param timeString - Время в формате HH:mm
     * @returns Время минус 1 час
     */
    const subtractOneHour = (timeString: string) => {
        return moment(timeString, 'HH:mm').subtract(1, 'hour').format('HH:mm');
    }

    /**
     * Добавляет 1 час к времени.
     * @param timeString - Время в формате HH:mm
     * @returns Время плюс 1 час
     */
    const addOneHour = (timeString: string) => {
        return moment(timeString, 'HH:mm').add(1, 'hour').format('HH:mm');
    }

    /**
     * Вычисляет минимальное допустимое время начала банкета.
     * Учитывает:
     * - Время открытия ресторана
     * - Максимальную длительность банкета (если задана)
     * - Выбранное время окончания
     * 
     * @returns Минимальное время начала или undefined
     */
    const getMinTimeForStart = () => {
      if (date) {
        // Start and end of restaurant working day
        const dayEnd = workTime[date.getDay()]?.time_end;
        const dayStart = workTime[date.getDay()]?.time_start;
        const { max_duration } = banquetOption || {};

        // If max_duration is set, calculate the earliest start time
        if (timeTo && timeTo.value !== 'до' && max_duration && max_duration > 0) {
          // Compute the limit to banquet start time: timeTo - max_duration
          const minStart = moment(timeTo.value as string, 'HH:mm').subtract(max_duration, 'hours').format('HH:mm');
          const minStartIsTheDayBefore = moment(minStart, 'HH:mm').isAfter(moment(timeTo.value as string, 'HH:mm')) || moment(timeTo.value as string, 'HH:mm').isAfter(moment(dayEnd as string, 'HH:mm'));

          // Check that restaurant closed before midnight
          if (moment(dayEnd, 'HH:mm').isAfter(moment(dayStart, 'HH:mm'))) {
            if (!minStartIsTheDayBefore) {
              // Both minStart and dayStart are in the same day
              return moment.max(moment(minStart, 'HH:mm'), moment(dayStart, 'HH:mm')).format('HH:mm');
            } else {
              // minStart is the day before restaurant is open
              return moment(dayStart, 'HH:mm').format('HH:mm');
            }
          } else { // Restaurant closes after midnight
            if (!minStartIsTheDayBefore) {
              // dayStart is the day before minStart
              return moment(minStart, 'HH:mm').format('HH:mm');
            } else {
              // Both minStart and dayStart are in the day before
              return moment.max(moment(minStart, 'HH:mm'), moment(dayStart, 'HH:mm')).format('HH:mm');
            }
          }
        }
        return dayStart;
      }
      return undefined;
    }

    /**
     * Вычисляет максимальное допустимое время начала банкета.
     * Равно времени окончания минус 1 час (или закрытию ресторана минус 1 час).
     * 
     * @returns Максимальное время начала или undefined
     */
    const getMaxTimeForStart = () => {
      return date ? (timeTo.value !== 'до' ? subtractOneHour(timeTo.value as string) : subtractOneHour(workTime[date.getDay()].time_end)) : undefined
    }

    /**
     * Вычисляет минимальное допустимое время окончания банкета.
     * Равно времени начала плюс 1 час (или открытию ресторана плюс 1 час).
     * 
     * @returns Минимальное время окончания или undefined
     */
    const getMinTimeForEnd = () => {
      return date ? (timeFrom.value !== 'с' ? addOneHour(timeFrom.value as string) : addOneHour(workTime[date.getDay()].time_start)) : undefined
    }

    /**
     * Вычисляет максимальное допустимое время окончания банкета.
     * Учитывает:
     * - Время закрытия ресторана
     * - Максимальную длительность банкета (если задана)
     * - Выбранное время начала
     * 
     * @returns Максимальное время окончания или undefined
     */
    const getMaxTimeForEnd = () => {
      if (date) {
        // Start and end of restaurant working day
        const dayEnd = workTime[date.getDay()].time_end;
        const dayStart = workTime[date.getDay()].time_start;
        const { max_duration } = banquetOption || {};

        // If max_duration is set, calculate the most latest end time
        if (timeFrom && timeFrom.value !== 'с' && max_duration && max_duration > 0) {
          // Compute the limit to banquet end time: timeFrom + max_duration
          const maxEnd = moment(timeFrom.value as string, 'HH:mm').add(max_duration, 'hours').format('HH:mm');
          const maxEndIsAfterMidnight = moment(maxEnd, 'HH:mm').isBefore(moment(timeFrom.value as string, 'HH:mm')) || moment(timeFrom.value as string, 'HH:mm').isBefore(moment(dayStart, 'HH:mm'));

          // Check that restaurant closed before midnight
          if (moment(dayStart, 'HH:mm').isBefore(moment(dayEnd, 'HH:mm'))) {
            if (!maxEndIsAfterMidnight) {
              // Both maxEnd and dayEnd are before midnight
              return moment.min(moment(maxEnd, 'HH:mm'), moment(dayEnd, 'HH:mm')).format('HH:mm');
            } else {
              // dayEnd is before midnight, but maxEnd is after
              return moment(dayEnd, 'HH:mm').format('HH:mm');
            }
          } else { // Restaurant closes after midnight
            if (!maxEndIsAfterMidnight) {
              // maxEnd is before midnight, but dayEnd is after
              return moment(maxEnd, 'HH:mm').format('HH:mm');
            } else {
              // Both maxEnd and dayEnd are after midnight
              return moment.min(moment(maxEnd, 'HH:mm'), moment(dayEnd, 'HH:mm')).format('HH:mm');
            }
          }
        }
        // if max_duration is not set, return the end of working day
        return dayEnd;
      }
      return undefined;
    }

    return (
        <Page back={true}>
            <BanquetOptionsPopup
                isOpen={isOpenPopup}
                closePopup={closePopup}
                guestCount={guestCount}
                setGuestCount={setGuestCount}
                minGuests={Number(banquetOption?.guests_min || 0)}
                maxGuests={Number(banquetOption?.guests_max || 0)}
            />
            <TimeSelectorPopup
                isOpen={!!date && isTimeFromPopup}
                closePopup={closeTimeFromPopup}
                time={timeFrom}
                setTimeOption={setTimeFrom}
                minTime={getMinTimeForStart()}
                maxTime={getMaxTimeForStart()}
            />
            <TimeSelectorPopup
                isOpen={!!date && isTimeToPopup}
                closePopup={closeTimeToPopup}
                time={timeTo}
                setTimeOption={setTimeTo}
                minTime={getMinTimeForEnd()}
                maxTime={getMaxTimeForEnd()}
            />
            <div className={css.page}>
                <CalendarPopup
                    banquet={banquetOption}
                    isOpen={calendarOpen}
                    setIsOpen={setCalendarOpen}
                    initialDate={new Date()}
                    currentDate={date ? date : undefined}
                    setDate={(date) => {
                        if (moment(date).isBefore(moment().add(1, 'days').startOf('day'))) {
                            return;
                        }
                        setDate(date);
                        setTimeFrom({
                            value: 'с',
                            title: '',
                        });
                        setTimeTo({
                            value: 'до',
                            title: '',
                        });
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
                            {banquetOption?.name}
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
                                            Желаемая дата
                                        </span>
                                    )}
                                </div>
                                <div className={css.timeInputs}>
                                    <TimeInput
                                        value={timeFrom.value as string}
                                        onClick={() => setTimeFromPopup(true)}
                                        icon={<TimeFromIcon size={24} />}
                                    />
                                    <TimeInput
                                        value={timeTo.value as string}
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
                                        <span>{guestCount?.title as string}</span>
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
                        {isFormValid && banquetOption?.deposit !== null && (
                            <ContentBlock>
                                <div className={css.payment}>
                                    <span className={css.payment_title}>
                                        Предварительная стоимость*:
                                    </span>
                                    <div className={css.payment_text}>
                                        <span>Депозит на человека:</span>
                                        <span>
                                            {
                                                banquetOption?.deposit
                                            }{' '}
                                            ₽
                                        </span>
                                    </div>
                                    <div className={css.payment_text}>
                                        <span>Депозит итого:</span>
                                        <span>
                                            {banquetOption &&
                                                guestCount.value !== 'unset' &&
                                                Number(banquetOption?.deposit) *
                                                parseInt(guestCount.value as string) +
                                                ' ₽'}
                                        </span>
                                    </div>
                                    <div className={css.payment_text}>
                                        <span>Сервисный сбор:</span>
                                        <span>
                                            {banquetOption?.service_fee}%
                                        </span>
                                    </div>
                                    <div className={css.payment_text}>
                                        <span>Итого:</span>
                                        <span>
                                            {banquetOption && getTotalPrice() + ' ₽'}
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
                <div className={css.button} style={{
                    position: isFormValid && banquetOption?.deposit !== null ? 'relative' : 'absolute',
                }}>
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
