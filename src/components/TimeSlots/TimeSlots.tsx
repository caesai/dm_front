import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import classNames from 'classnames';
// Utils
import { getTimeShort } from '@/utils.ts';
// Components
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
// Types
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
// Styles
import css from '@/pages/BookingPage/BookingPage.module.css';

/**
 * Константы.
 */

/**
 * Границы времени для определения части дня.
 * @constant
 */
const TIME_BOUNDARIES = {
    /** Начало утра (8:00) */
    MORNING_START: 8,
    /** Начало дня (12:00) */
    DAY_START: 12,
    /** Начало вечера (18:00) */
    EVENING_START: 18,
} as const;

/**
 * Типы.
 */

/**
 * Часть дня для группировки временных слотов.
 *
 * @typedef {'morning' | 'day' | 'evening'} PartOfDay
 * - `morning` — утренние слоты (08:00 - 11:59)
 * - `day` — дневные слоты (12:00 - 17:59)
 * - `evening` — вечерние слоты (18:00 и позже)
 */
type PartOfDay = 'morning' | 'day' | 'evening';

/**
 * Маппинг части дня на локализованное название.
 * @constant
 */
const PART_OF_DAY_LABELS: Record<PartOfDay, string> = {
    morning: 'Утро',
    day: 'День',
    evening: 'Вечер',
};

/**
 * Утилитарные функции.
 */

/**
 * Проверяет валидность временного слота.
 *
 * @param {ITimeSlot} slot - Временной слот для проверки
 * @returns {boolean} `true` если слот содержит корректные даты начала и конца
 *
 * @example
 * const slot = { start_datetime: '2024-01-15T10:00:00', end_datetime: '2024-01-15T12:00:00' };
 * isValidTimeSlot(slot); // true
 *
 * @example
 * const invalidSlot = { start_datetime: '', end_datetime: '' };
 * isValidTimeSlot(invalidSlot); // false
 */
const isValidTimeSlot = (slot: ITimeSlot): boolean => {
    if (!slot.start_datetime || !slot.end_datetime) return false;

    const startDate = new Date(slot.start_datetime);
    const endDate = new Date(slot.end_datetime);

    return !isNaN(startDate.getTime()) && !isNaN(endDate.getTime());
};

/**
 * Определяет часть дня по объекту Date.
 *
 * @param {Date} date - Дата для определения части дня
 * @returns {PartOfDay} Часть дня: 'morning', 'day' или 'evening'
 *
 * @example
 * getPartOfDay(new Date('2024-01-15T09:00:00')); // 'morning'
 * getPartOfDay(new Date('2024-01-15T14:00:00')); // 'day'
 * getPartOfDay(new Date('2024-01-15T20:00:00')); // 'evening'
 */
const getPartOfDay = (date: Date): PartOfDay => {
    const hours = date.getHours();

    if (hours >= TIME_BOUNDARIES.MORNING_START && hours < TIME_BOUNDARIES.DAY_START) {
        return 'morning';
    }
    if (hours >= TIME_BOUNDARIES.DAY_START && hours < TIME_BOUNDARIES.EVENING_START) {
        return 'day';
    }
    return 'evening';
};

/**
 * Фильтрует временные слоты по указанной части дня.
 *
 * @param {ITimeSlot[]} slots - Массив временных слотов
 * @param {PartOfDay} part - Часть дня для фильтрации
 * @returns {ITimeSlot[]} Отфильтрованный массив слотов
 *
 * @example
 * const slots = [...]; // массив слотов
 * const morningSlots = filterByPartOfDay(slots, 'morning');
 */
const filterByPartOfDay = (slots: ITimeSlot[], part: PartOfDay): ITimeSlot[] => {
    return slots.filter((slot) => getPartOfDay(new Date(slot.start_datetime)) === part);
};

/**
 * Определяет первую доступную часть дня из списка слотов.
 *
 * @param {ITimeSlot[]} morningSlots - Утренние слоты
 * @param {ITimeSlot[]} daySlots - Дневные слоты
 * @param {ITimeSlot[]} eveningSlots - Вечерние слоты
 * @returns {PartOfDay | null} Первая доступная часть дня или null
 */
const getFirstAvailablePartOfDay = (
    morningSlots: ITimeSlot[],
    daySlots: ITimeSlot[],
    eveningSlots: ITimeSlot[]
): PartOfDay | null => {
    if (morningSlots.length > 0) return 'morning';
    if (daySlots.length > 0) return 'day';
    if (eveningSlots.length > 0) return 'evening';
    return null;
};

/**
 * Компонент TimeSlotButton.
 */

/**
 * Пропсы компонента TimeSlotButton.
 *
 * @interface ITimeSlotButtonProps
 */
interface ITimeSlotButtonProps {
    /** Временной слот для отображения */
    slot: ITimeSlot;
    /** Флаг выбранного состояния */
    isSelected: boolean;
    /** Callback при клике на слот */
    onClick: (slot: ITimeSlot) => void;
}

/**
 * Кнопка выбора временного слота.
 *
 * Отображает время начала слота. При выбранном состоянии показывает
 * диапазон времени (начало - конец).
 *
 * @component
 * @param {ITimeSlotButtonProps} props - Пропсы компонента
 * @returns {JSX.Element | null} Кнопка времени или null для невалидного слота
 *
 * @example
 * <TimeSlotButton
 *     slot={{ start_datetime: '2024-01-15T10:00:00', end_datetime: '2024-01-15T12:00:00' }}
 *     isSelected={false}
 *     onClick={(slot) => console.log('Selected:', slot)}
 * />
 */
const TimeSlotButton: React.FC<ITimeSlotButtonProps> = React.memo(({ slot, isSelected, onClick }) => {
    const handleClick = useCallback(() => onClick(slot), [onClick, slot]);

    if (!isValidTimeSlot(slot)) return null;

    const timeLabel = isSelected
        ? `${getTimeShort(slot.start_datetime)} - ${getTimeShort(slot.end_datetime)}`
        : getTimeShort(slot.start_datetime);

    return (
        <div
            className={classNames(css.timeList_button, isSelected && css.timeList_button__active)}
            onClick={handleClick}
        >
            <span>{timeLabel}</span>
        </div>
    );
});

TimeSlotButton.displayName = 'TimeSlotButton';

/**
 * Компонент DayPartSelector.
 */

/**
 * Пропсы компонента DayPartSelector.
 *
 * @interface IDayPartSelectorProps
 */
interface IDayPartSelectorProps {
    /** Количество утренних слотов */
    morningCount: number;
    /** Количество дневных слотов */
    dayCount: number;
    /** Количество вечерних слотов */
    eveningCount: number;
    /** Текущая выбранная часть дня */
    currentPartOfDay: PartOfDay | null;
    /** Callback для изменения части дня */
    onPartOfDayChange: (part: PartOfDay) => void;
}

/**
 * Конфигурация для рендеринга кнопок частей дня.
 */
const DAY_PARTS_CONFIG: {
    part: PartOfDay;
    countKey: keyof Pick<IDayPartSelectorProps, 'morningCount' | 'dayCount' | 'eveningCount'>;
}[] = [
    { part: 'morning', countKey: 'morningCount' },
    { part: 'day', countKey: 'dayCount' },
    { part: 'evening', countKey: 'eveningCount' },
];

/**
 * Селектор части дня (утро/день/вечер).
 *
 * Отображает кнопки для переключения между частями дня.
 * Кнопка отображается только если есть доступные слоты для этой части дня.
 *
 * @component
 * @param {IDayPartSelectorProps} props - Пропсы компонента
 * @returns {JSX.Element} Селектор частей дня
 *
 * @example
 * <DayPartSelector
 *     morningCount={5}
 *     dayCount={10}
 *     eveningCount={3}
 *     currentPartOfDay="day"
 *     onPartOfDayChange={(part) => setPartOfDay(part)}
 * />
 */
const DayPartSelector: React.FC<IDayPartSelectorProps> = React.memo(
    ({ morningCount, dayCount, eveningCount, currentPartOfDay, onPartOfDayChange }) => {
        const counts = { morningCount, dayCount, eveningCount };

        return (
            <div className={css.select_timeOfDay}>
                {DAY_PARTS_CONFIG.map(({ part, countKey }) =>
                    counts[countKey] > 0 ? (
                        <div
                            key={part}
                            className={classNames(css.timeOfDay, currentPartOfDay === part && css.timeOfDay__active)}
                            onClick={() => onPartOfDayChange(part)}
                        >
                            <span>{PART_OF_DAY_LABELS[part]}</span>
                        </div>
                    ) : null
                )}
            </div>
        );
    }
);

DayPartSelector.displayName = 'DayPartSelector';

/**
 * Компонент TimeSlots.
 */

/**
 * Пропсы компонента TimeSlots.
 *
 * @interface ITimeSlotsProps
 */
interface ITimeSlotsProps {
    /** Флаг загрузки данных */
    loading: boolean;
    /** Массив доступных временных слотов */
    availableTimeslots: ITimeSlot[];
    /** Текущий выбранный временной слот */
    currentSelectedTime: ITimeSlot | null;
    /** Callback для изменения выбранного слота */
    setCurrentSelectedTime: (slot: ITimeSlot | null) => void;
    /**
     * Показывать селектор части дня (утро/день/вечер).
     * При `false` отображает все слоты в одном списке.
     * @default true
     */
    showDayPartSelector?: boolean;
    /**
     * Элемент для отображения в начале списка слотов (например, селектор даты).
     * Рендерится как первый слайд в Swiper.
     */
    startElement?: React.ReactNode;
    /** Дополнительный CSS-класс для корневого контейнера */
    className?: string;
    /** Инлайн-стили для корневого контейнера */
    style?: React.CSSProperties;
}

/**
 * Компонент выбора временного слота для бронирования.
 *
 * Особенности:
 * - Группирует слоты по частям дня (утро, день, вечер) — опционально
 * - Автоматически выбирает первую доступную часть дня
 * - Синхронизирует селектор части дня с выбранным слотом
 * - Отображает горизонтальный свайпер для выбора времени
 * - Поддерживает вставку элемента в начало списка (например, даты)
 * - Показывает skeleton при загрузке
 * - Отображает сообщение при отсутствии доступных слотов
 *
 * @component
 * @param {ITimeSlotsProps} props - Пропсы компонента
 * @returns {JSX.Element} Компонент выбора временных слотов
 *
 * @example
 * // С группировкой по частям дня (по умолчанию)
 * <TimeSlots
 *     loading={false}
 *     availableTimeslots={timeslots}
 *     currentSelectedTime={selectedTime}
 *     setCurrentSelectedTime={setSelectedTime}
 * />
 *
 * @example
 * // Без группировки с элементом даты в начале
 * <TimeSlots
 *     loading={false}
 *     availableTimeslots={timeslots}
 *     currentSelectedTime={selectedTime}
 *     setCurrentSelectedTime={setSelectedTime}
 *     showDayPartSelector={false}
 *     startElement={<DateSelector />}
 * />
 */
export const TimeSlots: React.FC<ITimeSlotsProps> = React.memo(({
    loading,
    availableTimeslots,
    currentSelectedTime,
    setCurrentSelectedTime,
    showDayPartSelector = true,
    startElement,
    className,
    style,
}) => {
    // Мемоизированные вычисления

    /** Отфильтрованные валидные слоты */
    const validTimeslots = useMemo(() => availableTimeslots.filter(isValidTimeSlot), [availableTimeslots]);

    /** Слоты, сгруппированные по частям дня */
    const groupedSlots = useMemo(
        () => ({
            morning: filterByPartOfDay(validTimeslots, 'morning'),
            day: filterByPartOfDay(validTimeslots, 'day'),
            evening: filterByPartOfDay(validTimeslots, 'evening'),
        }),
        [validTimeslots]
    );

    /** Флаг наличия хотя бы одного слота */
    const hasAnyTimeSlots = validTimeslots.length > 0;

    // Состояние

    /** Текущая выбранная часть дня */
    const [currentPartOfDay, setCurrentPartOfDay] = useState<PartOfDay | null>(null);

    // Эффекты

    /**
     * Устанавливает часть дня на основе выбранного слота или первой доступной.
     * Работает только при включенном селекторе части дня.
     */
    useEffect(() => {
        if (!showDayPartSelector) return;

        if (currentSelectedTime) {
            // Синхронизируем с выбранным слотом
            const part = getPartOfDay(new Date(currentSelectedTime.start_datetime));
            setCurrentPartOfDay(part);
        } else {
            // Выбираем первую доступную часть дня
            const firstAvailable = getFirstAvailablePartOfDay(
                groupedSlots.morning,
                groupedSlots.day,
                groupedSlots.evening
            );
            setCurrentPartOfDay(firstAvailable);
        }
    }, [currentSelectedTime, groupedSlots, showDayPartSelector]);

    // Вычисляемые значения

    /** Слоты для отображения (все или по части дня) */
    const displayedTimeslots = useMemo(() => {
        if (!showDayPartSelector) {
            return validTimeslots;
        }
        if (!currentPartOfDay) return [];
        return groupedSlots[currentPartOfDay];
    }, [showDayPartSelector, validTimeslots, currentPartOfDay, groupedSlots]);

    /** Индекс начального слайда для Swiper */
    const initialSlideIndex = useMemo(() => {
        if (!currentSelectedTime) return 0;
        const index = displayedTimeslots.findIndex(
            (slot) => slot.start_datetime === currentSelectedTime.start_datetime
        );
        return Math.max(0, index);
    }, [currentSelectedTime, displayedTimeslots]);

    // Рендеринг

    if (loading) {
        return <PlaceholderBlock width="100%" height={showDayPartSelector ? '115px' : '41px'} rounded="20px" />;
    }

    return (
        <div className={classNames(css.timeOfDayContainer, className)} style={style}>
            {!hasAnyTimeSlots ? (
                <span className={css.noTimeSlotsText}>К сожалению, свободных столов не осталось</span>
            ) : (
                showDayPartSelector && (
                    <DayPartSelector
                        morningCount={groupedSlots.morning.length}
                        dayCount={groupedSlots.day.length}
                        eveningCount={groupedSlots.evening.length}
                        currentPartOfDay={currentPartOfDay}
                        onPartOfDayChange={setCurrentPartOfDay}
                    />
                )
            )}

            {hasAnyTimeSlots && (
                <div className={css.timeList}>
                    {displayedTimeslots.length > 0 ? (
                        <Swiper
                            slidesPerView="auto"
                            modules={[FreeMode]}
                            freeMode
                            spaceBetween={8}
                            style={{ width: '100%' }}
                            initialSlide={initialSlideIndex}
                        >
                            {/* Опциональный элемент в начале (например, дата) */}
                            {startElement && <SwiperSlide style={{ width: 'max-content' }}>{startElement}</SwiperSlide>}
                            {displayedTimeslots.map((slot) => (
                                <SwiperSlide key={`time_${slot.start_datetime}`} style={{ width: 'max-content' }}>
                                    <TimeSlotButton
                                        slot={slot}
                                        isSelected={currentSelectedTime?.start_datetime === slot.start_datetime}
                                        onClick={setCurrentSelectedTime}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    ) : (
                        <span className={css.noTimeSlotsText}>
                            К сожалению, доступных столов на выбранную часть дня не осталось
                        </span>
                    )}
                </div>
            )}
        </div>
    );
});

TimeSlots.displayName = 'TimeSlots';
