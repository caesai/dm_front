import React, { useState, useMemo, useEffect } from 'react';
import { getCalendarDaysUTC } from '@/components/DatePicker/dateUtils.ts';
import css from './BanquetDatepicker.module.css';

interface DatePickerProps {
    onSelectDate?: (date: Date) => void;
    initialDate?: Date;
    currentDate?: Date;
}

export const BanquetDatepicker: React.FC<DatePickerProps> = ({
                                                                 onSelectDate,
                                                                 initialDate,
                                                                 currentDate
                                                             }) => {
    const now = initialDate || new Date();
    const [currentYear, setCurrentYear] = useState(now.getUTCFullYear());
    const [currentMonth, setCurrentMonth] = useState(now.getUTCMonth());
    const [selectedDate, setSelectedDate] = useState<Date>(now);

    const calendarDays = getCalendarDaysUTC(currentYear, currentMonth);

    const currentRealDate = new Date();
    const currentRealYear = currentRealDate.getUTCFullYear();
    const currentRealMonth = currentRealDate.getUTCMonth();

    const isPrevMonthDisabled = useMemo(() => {
        return currentYear <= currentRealYear && currentMonth <= currentRealMonth;
    }, [currentYear, currentMonth, currentRealYear, currentRealMonth]);

    const isPastDay = (date: Date): boolean => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Сбрасываем время для сравнения только дат

        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);

        return compareDate <= today;
    };

    const handlePrevMonth = () => {
        if (isPrevMonthDisabled) return;

        let newMonth = currentMonth - 1;
        let newYear = currentYear;
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const handleNextMonth = () => {
        let newMonth = currentMonth + 1;
        let newYear = currentYear;
        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentYear(parseInt(e.target.value, 10));
    };

    const handleDayClick = (fullDate: Date) => {
        if (isPastDay(fullDate)) return;
        setSelectedDate(fullDate);
        onSelectDate?.(fullDate);
    };

    const renderDays = () =>
        calendarDays.map((dayObj, idx) => {
            const { fullDate } = dayObj;
            const dayNumber = fullDate.getUTCDate();
            const isSelected = fullDate.getTime() === selectedDate.getTime();
            const isPast = isPastDay(fullDate);

            const classNames = [
                css.datepickerDay,
                css.active,
                isSelected ? css.current : '',
                isPast ? css.disabled : '',
            ]
                .filter(Boolean)
                .join(' ');

            return (
                <div
                    key={idx}
                    className={classNames}
                    onClick={() => handleDayClick(fullDate)}
                >
                    {dayNumber}
                </div>
            );
        });

    const _currentYear = new Date().getFullYear();
    const yearsRange = [];
    for (let y = _currentYear; y >= 1900; y--) {
        yearsRange.push(y);
    }

    const months = [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь',
    ];
    const monthName = months[currentMonth];

    useEffect(() => {
        if (!currentDate) return
        setSelectedDate(currentDate);
    }, [currentDate]);

    return (
        <div className={css.datepickerContainer}>
            <div className={css.datepickerHeader}>
                <div className={css.monthYearSelect}>
                    <span className={css.monthName}>{monthName}</span>
                    <select
                        className={css.yearSelect}
                        value={currentYear}
                        onChange={handleYearChange}
                    >
                        {yearsRange.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <button
                        className={`${css.navButton} ${isPrevMonthDisabled ? css.disabled : ''}`}
                        onClick={handlePrevMonth}
                        disabled={isPrevMonthDisabled}
                        dangerouslySetInnerHTML={{ __html: '&#10094;' }}
                    />
                    <button
                        className={css.navButton}
                        onClick={handleNextMonth}
                        dangerouslySetInnerHTML={{ __html: '&#10095;' }}
                    />
                </div>
            </div>

            <div className={css.datepickerWeekdays}>
                <div className={css.datepickerWeekday}>Пн</div>
                <div className={css.datepickerWeekday}>Вт</div>
                <div className={css.datepickerWeekday}>Ср</div>
                <div className={css.datepickerWeekday}>Чт</div>
                <div className={css.datepickerWeekday}>Пт</div>
                <div className={css.datepickerWeekday}>Сб</div>
                <div className={css.datepickerWeekday}>Вс</div>
            </div>

            <div className={css.datepickerDays}>{renderDays()}</div>
        </div>
    );
};