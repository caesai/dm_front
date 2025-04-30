// Вспомогательные функции для DatePicker

/**
 * Возвращает массив объектов, описывающих каждый день для текущего месяца,
 * включая несколько дней предыдущего и следующего месяца для полной сетки.
 */
export const getCalendarDaysUTC = (year: number, month: number) => {
    const result: Array<{
        fullDate: Date;
        isCurrentMonth: boolean;
        isToday: boolean;
    }> = [];

    // Определяем дату 1-го числа текущего месяца в UTC
    // (NB: month тот же индекс, что и в обычном Date, 0 = Январь)
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1));

    // Получаем день недели (0 = Вс, 1 = Пн, ..., 6 = Сб) – но только с getUTCDay()
    let startIndex = firstDayOfMonth.getUTCDay() - 1;
    // Если нужно начать неделю с Понедельника: Пн=0, Вт=1, ..., Вс=6
    if (startIndex < 0) startIndex = 6;

    // Определяем, сколько дней нужно показать из «предыдущего» месяца
    // Берём последний день прошлого месяца, смотрим его дату (UTC)
    const prevMonthLastDay = new Date(Date.UTC(year, month, 0)); // 0е число текущего = последний день предыдущего
    const daysInPrevMonth = prevMonthLastDay.getUTCDate(); // сколько дней было в прошлом месяце

    // 1. Добавляем «хвост» предыдущего месяца
    for (let i = 0; i < startIndex; i++) {
        const dayNumber = daysInPrevMonth - startIndex + i + 1;
        const date = new Date(
            Date.UTC(
                prevMonthLastDay.getUTCFullYear(),
                prevMonthLastDay.getUTCMonth(),
                dayNumber
            )
        );
        result.push({
            fullDate: date,
            isCurrentMonth: false,
            isToday: isSameDayUTC(date, new Date()),
        });
    }

    // 2. Добавляем текущий месяц
    const daysInCurrentMonth = new Date(
        Date.UTC(year, month + 1, 0)
    ).getUTCDate();
    for (let day = 1; day <= daysInCurrentMonth; day++) {
        const date = new Date(Date.UTC(year, month, day));
        result.push({
            fullDate: date,
            isCurrentMonth: true,
            isToday: isSameDayUTC(date, new Date()),
        });
    }

    // 3. Добавляем остаток дней, чтобы сетка заняла 6 строк по 7 столбцов = 42 дня
    const totalCells = 42;
    const nextDaysCount = totalCells - result.length;
    // Первый день «следующего» месяца = (year, month + 1, 1)
    for (let i = 1; i <= nextDaysCount; i++) {
        const date = new Date(Date.UTC(year, month + 1, i));
        result.push({
            fullDate: date,
            isCurrentMonth: false,
            isToday: isSameDayUTC(date, new Date()),
        });
    }

    return result;
};

// Сравнение двух дат «по дням», используя UTC
function isSameDayUTC(a: Date, b: Date) {
    return (
        a.getUTCFullYear() === b.getUTCFullYear() &&
        a.getUTCMonth() === b.getUTCMonth() &&
        a.getUTCDate() === b.getUTCDate()
    );
}
