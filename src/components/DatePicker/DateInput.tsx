import React, { useState } from 'react';
import { getCalendarDaysUTC } from './dateUtils';
import './DateInput.css';

interface DatePickerProps {
    onSelectDate?: (date: Date) => void;
    initialDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    onSelectDate,
    initialDate,
}) => {
    // Считаем, что initialDate — уже «UTC-полночь» или пусть любая
    // Либо зададим просто текущий момент
    const now = initialDate || new Date();

    // Берём год/месяц из UTC
    const [currentYear, setCurrentYear] = useState(now.getUTCFullYear());
    const [currentMonth, setCurrentMonth] = useState(now.getUTCMonth());
    const [selectedDate, setSelectedDate] = useState<Date>(now);

    // Массив ячеек календаря (42 ячейки), всё в UTC
    const calendarDays = getCalendarDaysUTC(currentYear, currentMonth);

    // Логика переключения месяцев (UTC не влияет — год/месяц одинаково)
    const handlePrevMonth = () => {
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

    // При клике на день сохраняем дату (UTC)
    const handleDayClick = (fullDate: Date, isCurrentMonth: boolean) => {
        if (!isCurrentMonth) return;
        setSelectedDate(fullDate);
        onSelectDate?.(fullDate);
    };

    // Отрисовка 42 дней
    const renderDays = () =>
        calendarDays.map((dayObj, idx) => {
            const { fullDate, isCurrentMonth, isToday } = dayObj;
            // Получаем число дня через getUTCDate()
            const dayNumber = fullDate.getUTCDate();

            // Сравниваем по getTime() или по UTC
            const isSelected = fullDate.getTime() === selectedDate.getTime();

            const classes = [
                'datepicker-day',
                isCurrentMonth ? 'in-month' : 'out-month',
                isToday ? 'today' : '',
                isSelected ? 'selected' : '',
            ]
                .filter(Boolean)
                .join(' ');

            return (
                <div
                    key={idx}
                    className={classes}
                    onClick={() => handleDayClick(fullDate, isCurrentMonth)}
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

    // Названия месяцев
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

    return (
        <div className="datepicker-container">
            <div className="datepicker-header">
                <div className="month-year-select">
                    <span className="month-name">{monthName}</span>
                    <select
                        className="year-select"
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
                    <button className="nav-button" onClick={handlePrevMonth}>
                        &#10094;
                    </button>
                    <button className="nav-button" onClick={handleNextMonth}>
                        &#10095;
                    </button>
                </div>
            </div>

            <div className="datepicker-weekdays">
                <div className={'datepicker-weekday'}>Пн</div>
                <div className={'datepicker-weekday'}>Вт</div>
                <div className={'datepicker-weekday'}>Ср</div>
                <div className={'datepicker-weekday'}>Чт</div>
                <div className={'datepicker-weekday'}>Пт</div>
                <div className={'datepicker-weekday'}>Сб</div>
                <div className={'datepicker-weekday'}>Вс</div>
            </div>

            <div className="datepicker-days">{renderDays()}</div>
        </div>
    );
};
