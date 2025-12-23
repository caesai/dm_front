import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { getTimeShort } from '@/utils.ts';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import classNames from 'classnames';
import css from '@/pages/BookingPage/BookingPage.module.css';
// import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
// import { BASE_BOT } from '@/api/base';
// import { R } from '@/__mocks__/restaurant.mock';
// import { BASE_BOT } from '@/api/base.ts';

// Define the type for the part of the day
type PartOfDay = 'morning' | 'day' | 'evening';

// Helper function to validate a time slot
const isValidTimeSlot = (slot: ITimeSlot): boolean => {
    if (!slot.start_datetime || !slot.end_datetime) return false;

    const startDate = new Date(slot.start_datetime);
    const endDate = new Date(slot.end_datetime);

    return !(isNaN(startDate.getTime()) || isNaN(endDate.getTime()));
};

// Helper function to determine the part of the day from a date
const getPartOfDay = (dt: Date): PartOfDay => {
    const hours = dt.getHours();
    if (hours >= 8 && hours < 12) return 'morning';
    if (hours >= 12 && hours < 18) return 'day';
    return 'evening'; // Covers 18:00 - 00:00 (0)
};

// Helper function to filter timeslots by part of day
const filterByPartOfDay = (slots: ITimeSlot[], part: PartOfDay): ITimeSlot[] => {
    return slots.filter(v => getPartOfDay(new Date(v.start_datetime)) === part);
};

// --- Sub-components for cleaner rendering ---

interface TimeSlotButtonProps {
    slot: ITimeSlot;
    isSelected: boolean;
    onClick: (slot: ITimeSlot) => void;
}

const TimeSlotButton: React.FC<TimeSlotButtonProps> = React.memo(({ slot, isSelected, onClick }) => {
    const handleClick = useCallback(() => onClick(slot), [onClick, slot]);

    if (!isValidTimeSlot(slot)) return null;

    return (
        <div
            className={classNames(
                css.timeList_button,
                isSelected ? css.timeList_button__active : null,
            )}
            onClick={handleClick}
        >
            <span>
                {isSelected
                    ? `${getTimeShort(slot.start_datetime)} - ${getTimeShort(slot.end_datetime)}`
                    : getTimeShort(slot.start_datetime)}
            </span>
        </div>
    );
});

interface DayPartSelectorProps {
    morningCount: number;
    dayCount: number;
    eveningCount: number;
    currentPartOfDay: PartOfDay | null;
    setCurrentPartOfDay: (part: PartOfDay) => void;
}

const DayPartSelector: React.FC<DayPartSelectorProps> = React.memo(({ morningCount, dayCount, eveningCount, currentPartOfDay, setCurrentPartOfDay }) => (
    <div className={css.select_timeOfDay}>
        {morningCount > 0 && (
            <div
                className={classNames(css.timeOfDay, currentPartOfDay === 'morning' && css.timeOfDay__active)}
                onClick={() => setCurrentPartOfDay('morning')}
            >
                <span>Утро</span>
            </div>
        )}
        {dayCount > 0 && (
            <div
                className={classNames(css.timeOfDay, currentPartOfDay === 'day' && css.timeOfDay__active)}
                onClick={() => setCurrentPartOfDay('day')}
            >
                <span>День</span>
            </div>
        )}
        {eveningCount > 0 && (
            <div
                className={classNames(css.timeOfDay, currentPartOfDay === 'evening' && css.timeOfDay__active)}
                onClick={() => setCurrentPartOfDay('evening')}
            >
                <span>Вечер</span>
            </div>
        )}
    </div>
));

// --- Main Component ---

interface TimeSlotProps {
    loading: boolean;
    availableTimeslots: ITimeSlot[];
    currentSelectedTime: ITimeSlot | null;
    setCurrentSelectedTime: (currentSelectedTime: ITimeSlot | null) => void;
    restaurantId?: number;
}

export const TimeSlots: React.FC<TimeSlotProps> = ({
    loading,
    availableTimeslots,
    currentSelectedTime,
    setCurrentSelectedTime,
}) => {
    // Filter out invalid timeslots first
    const validTimeslots = useMemo(() => availableTimeslots.filter(isValidTimeSlot), [availableTimeslots]);

    // Filter timeslots into categories using helper functions
    const morningTimeslots = useMemo(() => filterByPartOfDay(validTimeslots, 'morning'), [validTimeslots]);
    const dayTimeslots = useMemo(() => filterByPartOfDay(validTimeslots, 'day'), [validTimeslots]);
    const eveningTimeslots = useMemo(() => filterByPartOfDay(validTimeslots, 'evening'), [validTimeslots]);

    // Use local state to manage the active part of the day UI selection
    const [currentPartOfDay, setCurrentPartOfDay] = useState<PartOfDay | null>(null);

    // Determine which slots to show based on the active part of the day
    const filteredTimeslots = useMemo(() => {
        if (currentPartOfDay === 'morning') return morningTimeslots;
        if (currentPartOfDay === 'day') return dayTimeslots;
        if (currentPartOfDay === 'evening') return eveningTimeslots;
        return [];
    }, [currentPartOfDay, morningTimeslots, dayTimeslots, eveningTimeslots]);

    // Set default part of day initially or when available slots change
    useEffect(() => {
        // Only set the default part of the day if a time hasn't already been selected
        if (!currentSelectedTime) {
            if (morningTimeslots.length > 0) setCurrentPartOfDay('morning');
            else if (dayTimeslots.length > 0) setCurrentPartOfDay('day');
            else if (eveningTimeslots.length > 0) setCurrentPartOfDay('evening');
            else setCurrentPartOfDay(null);
        }
    }, [validTimeslots, morningTimeslots, dayTimeslots, eveningTimeslots, currentSelectedTime]);

    // Sync part of day selector when the externally managed currentSelectedTime changes
    useEffect(() => {
        if (currentSelectedTime) {
            const part = getPartOfDay(new Date(currentSelectedTime.start_datetime));
            setCurrentPartOfDay(part);
        }
    }, [currentSelectedTime]);

    // Handle initial slide position logic cleanly using useMemo and effect
    const initialSlideIndex = useMemo(() => {
        if (!currentSelectedTime) return 0;
        return filteredTimeslots.findIndex(item => item.start_datetime === currentSelectedTime.start_datetime);
    }, [currentSelectedTime, filteredTimeslots]);

    if (loading) {
        return <PlaceholderBlock width={'100%'} height={'115px'} rounded={'20px'} />;
    }

    // Check if there are any slots at all
    const hasAnyTimeSlots = validTimeslots.length > 0;

    // const hideApp = () => {
    //     // window.location.href = "tg:resolve";
    //     if (window.Telegram.WebApp) {
    //         window.location.href = `https://t.me/${BASE_BOT}?start=find_table-${restaurantId}`
    //         window.Telegram.WebApp.close();
    //     } else {
    //         window.location.href = `https://t.me/${BASE_BOT}?start=find_table-${restaurantId}`
    //     }
    // }

    return (
        <ContentContainer>
            <div className={css.timeOfDayContainer}>
                {!hasAnyTimeSlots ? (
                    <span className={css.noTimeSlotsText}>
                        К сожалению, свободных столов не осталось
                    </span>
                ) : (
                    <DayPartSelector
                        morningCount={morningTimeslots.length}
                        dayCount={dayTimeslots.length}
                        eveningCount={eveningTimeslots.length}
                        currentPartOfDay={currentPartOfDay}
                        setCurrentPartOfDay={setCurrentPartOfDay}
                    />
                )}

                {hasAnyTimeSlots && (
                    <div className={css.timeList}>
                        {filteredTimeslots.length > 0 ? (
                            <Swiper
                                slidesPerView="auto"
                                modules={[FreeMode]}
                                freeMode={true}
                                spaceBetween={8}
                                style={{ width: '100%' }}
                                initialSlide={initialSlideIndex}
                                // initialSlide is set by the effect above
                            >
                                {filteredTimeslots.map((v) => (
                                    <SwiperSlide
                                        key={`time_${v.start_datetime}`}
                                        style={{ width: 'max-content' }}
                                    >
                                        <TimeSlotButton
                                            slot={v}
                                            isSelected={currentSelectedTime?.start_datetime === v.start_datetime}
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
                {/** TODO: Убрать условие после 21.12.2025 */}
                {/* Если ресторан не SELF_EDGE_SPB_CHINOIS_ID, то показываем кнопку "Не нашли стол на желаемую дату и время?" */}
                {/* {restaurantId !== Number(R.SELF_EDGE_SPB_CHINOIS_ID) && (
                    <UniversalButton
                        action={hideApp}
                        width={'full'}
                        title={'Не нашли стол на желаемую дату и время?'}
                        style={{ fontSize: 12, color: "gray", textDecoration: 'underline', fontFamily: 'Mont'}} />
                )} */}
            </div>
        </ContentContainer>
    );
};
