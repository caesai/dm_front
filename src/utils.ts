import { IWorkTime } from '@/types/restaurant.ts';
import { IEventBooking, IEventDate } from '@/pages/EventsPage/EventsPage.tsx';
import { Dispatch, SetStateAction } from 'react';
import moment from 'moment';
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
// import { IEventBooking } from '@/pages/EventsPage/EventsPage.tsx';
// import { Dispatch, SetStateAction } from 'react';

export const callPhone = (tel: string) => {
    // https://github.com/Telegram-Mini-Apps/telegram-apps/issues/677
    window.open(`tel:${tel}`, '_blank');
};

export const getGuestsString = (num: string | number): string => {
    let parsedNum;

    if (typeof num === 'number') {
        parsedNum = num;
    } else {
        parsedNum = Number.parseInt(num);
    }

    if (isNaN(parsedNum)) {
        return 'Гости';
    }

    const n = parsedNum % 100;
    if (n >= 11 && n <= 14) {
        return `${num} гостей`;
    }
    const lastDigit = n % 10;
    switch (lastDigit) {
        case 1:
            return `${num} гость`;
        case 2:
        case 3:
        case 4:
            return `${num} гостя`;
        default:
            return `${num} гостей`;
    }
};

const MONTHS = [
    'янв',
    'фев',
    'мар',
    'апр',
    'май',
    'июн',
    'июл',
    'авг',
    'сен',
    'окт',
    'ноя',
    'дек',
];
const MONTHS_LONG = [
    'январь',
    'февраль',
    'март',
    'апрель',
    'май',
    'июнь',
    'июль',
    'август',
    'сентябрь',
    'октябрь',
    'ноябрь',
    'декабрь',
];
const MONTHS_LONG2 = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
];
const weekdaysMap: Record<number, string> = {
    0: 'вс',
    1: 'пн',
    2: 'вт',
    3: 'ср',
    4: 'чт',
    5: 'пт',
    6: 'сб',
};

export const formatDate = (inputDate: string): string => {
    const today = new Date();
    const input = new Date(inputDate);

    // Убираем время, чтобы сравнивать только даты
    today.setHours(0, 0, 0, 0);
    input.setHours(0, 0, 0, 0);

    const day = input.getDate();
    const month = MONTHS_LONG2[input.getMonth()];

    if (input.getTime() === today.getTime()) {
        return `Сегодня, ${day} ${month}`;
    } else if (input.getTime() === today.getTime() + 86400000) {
        // 86400000 миллисекунд в одном дне
        return `Завтра, ${day} ${month}`;
    } else {
        return `${day} ${month}`;
    }
};
export const formatDateAlt = (inputDate: string): string => {
    const today = new Date();
    const input = new Date(inputDate);

    // Убираем время, чтобы сравнивать только даты
    today.setHours(0, 0, 0, 0);
    input.setHours(0, 0, 0, 0);

    const day = input.getDate();
    const month = MONTHS_LONG2[input.getMonth()];

    if (input.getTime() === today.getTime()) {
        return `Сегодня`;
    } else if (input.getTime() === today.getTime() + 86400000) {
        // 86400000 миллисекунд в одном дне
        return `Завтра`;
    } else {
        return `${day} ${month}`;
    }
};

export const formatDateCalendar = (inputDate: Date): string => {
    const month = MONTHS_LONG[inputDate.getMonth()];
    const year = inputDate.getFullYear();

    return `${month} ${year}`;
};

export const formatDateDT = (inputDate: Date): string => {
    const day = inputDate.getDate();
    const month = MONTHS[inputDate.getMonth()];

    return `${day} ${month}`;
};

export const formatDateDayMonthLong = (inputDate: string): string => {
    const input = new Date(inputDate);
    const day = input.getDate();
    const month = MONTHS_LONG2[input.getMonth()];

    return `${day} ${month}`;
};
export const formatDateShort = (inputDate: string): string => {
    const today = new Date();
    const input = new Date(inputDate);

    // Убираем время, чтобы сравнивать только даты
    today.setHours(0, 0, 0, 0);
    input.setHours(0, 0, 0, 0);

    const day = input.getDate();
    const month = MONTHS[input.getMonth()];

    return `${day} ${month}`;
};

export const formatDateMonthShort = (inputDate: string): string => {
    const input = new Date(inputDate);
    return MONTHS[input.getMonth()];
};
export const formatDateDayShort = (inputDate: string): string => {
    const input = new Date(inputDate);
    return String(input.getDate());
};

export const getCurrentWeekdayShort = (): string => {
    const today = new Date();
    const month = weekdaysMap[today.getDay()];
    return `${month}`;
};

export const getCurrentTimeShort = (): string => {
    const today = new Date();
    const t = today.toLocaleTimeString();
    return `${t.split(':')[0]}:${t.split(':')[1]}`;
};
export const getTimeShort = (dt: string): string => {
    const today = new Date(dt);
    const t = today.toLocaleTimeString();
    return `${t.split(':')[0]}:${t.split(':')[1]}`;
};

export function formatWorkTime(worktime: IWorkTime[]): string[] {
    const result: string[] = [];
    let currentRange: IWorkTime[] = [];

    for (let i = 0; i < worktime.length; i++) {
        if (currentRange.length === 0) {
            currentRange.push(worktime[i]);
            continue;
        }

        const last = currentRange[currentRange.length - 1];
        const current = worktime[i];

        if (
            last.time_start === current.time_start &&
            last.time_end === current.time_end
        ) {
            currentRange.push(current);
        } else {
            addToResult(currentRange, result);
            currentRange = [current];
        }
    }

    if (currentRange.length > 0) {
        addToResult(currentRange, result);
    }

    return result;
}

function addToResult(range: IWorkTime[], result: string[]): void {
    if (range.length === 1) {
        result.push(
            `${range[0].weekday}: ${range[0].time_start} - ${range[0].time_end}`
        );
    } else {
        const first = range[0].weekday;
        const last = range[range.length - 1].weekday;
        result.push(
            `${first}-${last}: ${range[0].time_start} - ${range[0].time_end}`
        );
    }
}

// export type IEventBookingContext = [
//     IEventBooking,
//     Dispatch<SetStateAction<IEventBooking>>,
// ];

// Для удобства сопоставим дни недели с их индексами.
const dayIndexMap: Record<string, number> = {
    пн: 0,
    вт: 1,
    ср: 2,
    чт: 3,
    пт: 4,
    сб: 5,
    вс: 6,
};

// Функция для перевода строки 'HH:mm' в количество минут с начала суток.
function parseTimeToMinutes(timeStr: string): number {
    const [hh, mm] = timeStr.split(':').map(Number);
    return hh * 60 + mm;
}

// Функция для перевода минут в строку 'HH:mm' (например, 130 -> '02:10').
function formatMinutesToTime(totalMins: number): string {
    // Приводим минуты к “внутренним” суткам (0-1440), если нужно
    // (для отображения времени в диапазоне 00:00–23:59).
    const minsInDay = totalMins % 1440;
    const hh = Math.floor(minsInDay / 60);
    const mm = minsInDay % 60;
    // Дополняем нулями при необходимости
    const hhStr = hh.toString().padStart(2, '0');
    const mmStr = mm.toString().padStart(2, '0');
    return `${hhStr}:${mmStr}`;
}

/**
 * Определяет, до скольки ресторан открыт или когда откроется, исходя из массива worktime.
 * @param worktime - массив расписаний на каждый день
 * @param currentWeekday - текущее сокращенное название дня ('пн','вт','...' )
 * @param currentTimeStr - текущее время в формате 'HH:mm'
 * @returns Строка вида "Открыто до 02:00" или "Откроется в 10:00"
 */
export const getRestaurantStatus = (
    worktime: IWorkTime[],
    currentWeekday: string,
    currentTimeStr: string
): string => {
    const currentDayIndex = dayIndexMap[currentWeekday];
    const currentMins = parseTimeToMinutes(currentTimeStr);

    // Разделим расписание по дням для удобства
    const scheduleByDay: Record<number, { start: number; end: number }[]> = {};
    for (const wt of worktime) {
        const dIndex = dayIndexMap[wt.weekday];
        const start = parseTimeToMinutes(wt.time_start);
        let end = parseTimeToMinutes(wt.time_end);
        // Если время окончания меньше или равно времени начала,
        // значит конец идет уже за полночь (прицепим сутки)
        if (end <= start) {
            end += 24 * 60; // +1440
        }
        if (!scheduleByDay[dIndex]) {
            scheduleByDay[dIndex] = [];
        }
        scheduleByDay[dIndex].push({ start, end });
    }

    // Упорядочим интервалы для каждого дня по времени старта
    for (const day in scheduleByDay) {
        scheduleByDay[day].sort((a, b) => a.start - b.start);
    }

    // 1) Проверяем, не обслуживается ли текущее время "со вчера" (для случаев 09:00–02:00).
    //    То есть, если сейчас 00:30 субботы (dayIndex=5), нужно смотреть пятничный (dayIndex=4) слот, который тянется за полночь.
    const prevDayIndex = (currentDayIndex + 6) % 7; // (currentDayIndex - 1) с учётом "закольцовки"

    if (scheduleByDay[prevDayIndex]) {
        // Проверим каждый слот предыдущего дня
        for (const interval of scheduleByDay[prevDayIndex]) {
            const { start, end } = interval;
            // Время идёт с (prevDayIndex, start) до (prevDayIndex, end),
            // если end>1440, значит физически оно заканчивается уже на currentDayIndex.
            // Например: start=540(09:00), end=1560(добавили сутки к 02:00).
            // Чтобы выяснить, не попадает ли текущее время (уже в новый день),
            // прибавим к currentMins 1440, если мы проверяем именно "хвост" предыдущего дня.
            if (end > 1440) {
                // "Сдвигаем" текущее время, чтобы понять, попадает ли оно в этот отрезок
                const shiftedCurrent = currentMins + 1440; // время субботы, относительно пятницы
                if (shiftedCurrent >= start && shiftedCurrent < end) {
                    // Ресторан сейчас открыт
                    // Покажем, до скольки (end) – но отформатируем с учётом обычных суток
                    return `Открыто до ${formatMinutesToTime(end)}`;
                }
            }
        }
    }

    // 2) Если мы дошли сюда, значит либо ресторан не открыт «со вчера», либо нет слотов с переходом через полночь.
    //    Проверяем текущий день. Смотрим все интервалы. Может быть, он открыт уже сегодня, или скоро откроется.
    if (scheduleByDay[currentDayIndex]) {
        for (const interval of scheduleByDay[currentDayIndex]) {
            const { start, end } = interval;
            // Если currentMins попадает в [start, end),
            // значит ресторан открыт и закроется в end (или end % 1440, если end>1440 — обычно не бывает в тот же день)
            if (currentMins >= start && currentMins < end) {
                return `Открыто до ${formatMinutesToTime(end)}`;
            }
        }
        // Если ни в один интервал текущего дня не попали, значит сейчас закрыто,
        // но возможно сегодня позже откроется. Найдём первый интервал, у которого start > currentMins
        const nextInterval = scheduleByDay[currentDayIndex]
            .filter((interval) => interval.start > currentMins)
            .sort((a, b) => a.start - b.start)[0];
        if (nextInterval) {
            return `Откроется в ${formatMinutesToTime(nextInterval.start)}`;
        }
    }

    // 3) Если и в текущий день интервалов нет или все прошли – берём следующий день (с учётом, что пользователь смотрит "сегодня ночью", а ресторан откроется завтра).
    //    В простом варианте смотрим только на "завтра".
    const nextDay = (currentDayIndex + 1) % 7;
    if (scheduleByDay[nextDay] && scheduleByDay[nextDay].length) {
        // Берём самое раннее открытие
        const earliest = scheduleByDay[nextDay].reduce((acc, interval) =>
            interval.start < acc.start ? interval : acc
        );
        return `Откроется в ${formatMinutesToTime(earliest.start)}`;
    }

    // Если вообще нет рабочих слотов ни сегодня, ни завтра, вернём что-то общее:
    return 'Сегодня не работает';
};

interface RestaurantStatus {
    status: 'open' | 'closed';
    interval: string;
}

export const getRestaurantStatusTyped = (
    worktime: IWorkTime[],
    currentWeekday: string,
    currentTimeStr: string
): RestaurantStatus => {
    const currentDayIndex = dayIndexMap[currentWeekday];
    const currentMins = parseTimeToMinutes(currentTimeStr);

    // Разделим расписание по дням для удобства
    const scheduleByDay: Record<number, { start: number; end: number }[]> = {};
    for (const wt of worktime) {
        const dIndex = dayIndexMap[wt.weekday];
        const start = parseTimeToMinutes(wt.time_start);
        let end = parseTimeToMinutes(wt.time_end);
        if (end <= start) {
            end += 24 * 60; // +1440
        }
        if (!scheduleByDay[dIndex]) {
            scheduleByDay[dIndex] = [];
        }
        scheduleByDay[dIndex].push({ start, end });
    }

    for (const day in scheduleByDay) {
        scheduleByDay[day].sort((a, b) => a.start - b.start);
    }

    const prevDayIndex = (currentDayIndex + 6) % 7; // (currentDayIndex - 1) с учётом "закольцовки"

    if (scheduleByDay[prevDayIndex]) {
        // Проверим каждый слот предыдущего дня
        for (const interval of scheduleByDay[prevDayIndex]) {
            const { start, end } = interval;
            if (end > 1440) {
                const shiftedCurrent = currentMins + 1440;
                if (shiftedCurrent >= start && shiftedCurrent < end) {
                    return {
                        status: 'open',
                        interval: formatMinutesToTime(end),
                    };
                }
            }
        }
    }

    if (scheduleByDay[currentDayIndex]) {
        for (const interval of scheduleByDay[currentDayIndex]) {
            const { start, end } = interval;
            if (currentMins >= start && currentMins < end) {
                return { status: 'open', interval: formatMinutesToTime(end) };
            }
        }
        const nextInterval = scheduleByDay[currentDayIndex]
            .filter((interval) => interval.start > currentMins)
            .sort((a, b) => a.start - b.start)[0];
        if (nextInterval) {
            return {
                status: 'closed',
                interval: formatMinutesToTime(nextInterval.start),
            };
        }
    }

    const nextDay = (currentDayIndex + 1) % 7;
    if (scheduleByDay[nextDay] && scheduleByDay[nextDay].length) {
        const earliest = scheduleByDay[nextDay].reduce((acc, interval) =>
            interval.start < acc.start ? interval : acc
        );
        return {
            status: 'closed',
            interval: formatMinutesToTime(earliest.start),
        };
    }
    return { status: 'closed', interval: '' };
};

export type IEventBookingContext = [
    IEventBooking,
    Dispatch<SetStateAction<IEventBooking>>,
];

export const findCurrentDate = (
    bookingInfo: IEventBooking,
    date: ITimeSlot
): IEventDate | undefined => {
    return bookingInfo.restaurant?.dates.find((v) => {
        return (
            moment(date.start_datetime).isSameOrAfter(moment(v.date_start)) &&
            moment(date.start_datetime).isSameOrBefore(moment(v.date_end))
        );
    });
};
