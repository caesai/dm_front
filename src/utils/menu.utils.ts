/**
 * Извлекает цену из массива prices API ответа.
 *
 * @param prices - Массив объектов с ценами из API
 * @returns Числовое значение цены или 0, если цена не найдена
 */
export const extractPrice = (prices: any[] | undefined): number => {
    if (!prices || prices.length === 0) return 0;

    const priceObj = prices[0];
    if (!priceObj || typeof priceObj !== 'object') return 0;

    const keys = Object.keys(priceObj);
    if (keys.length === 0) return 0;

    const firstKey = keys[0];
    const priceData = priceObj[firstKey];

    if (typeof priceData === 'number') return priceData;

    if (typeof priceData === 'object' && priceData !== null) {
        return priceData.value || priceData.price || priceData.amount || 0;
    }

    return 0;
};

/**
 * Возвращает дефолтный размер блюда.
 *
 * @param sizes - Список размеров из API
 * @returns Дефолтный размер или первый элемент массива
 */
export const getDefaultSize = <T extends { is_default?: boolean }>(sizes: T[]): T | undefined => {
    return sizes.find((s) => s.is_default) || sizes[0];
};

/**
 * Приводит системный код единицы измерения из API к человеко‑понятному виду.
 *
 * В айко / API могут приходить значения вроде:
 * - "GRAM", "GRAMS", "грамм", "г"  → "г"
 * - "KILOGRAM", "KG", "килограмм"  → "кг"
 * - "MILLILITER", "ML", "миллилитр" → "мл"
 * - "LITER", "L", "литр"           → "л"
 *
 * Все остальные значения возвращаются как есть.
 *
 * @param unit - Сырое значение единицы измерения из API (measure_unit_type)
 * @returns Отформатированная единица измерения для отображения в интерфейсе
 */
export const formatMeasureUnitType = (unit?: string | null): string => {
    if (!unit) return '';

    const normalized = unit.trim().toLowerCase();

    // Граммы
    if (
        ['gram', 'grams', 'gramm', 'g', 'грамм', 'граммы', 'г'].includes(
            normalized
        )
    ) {
        return 'г';
    }

    // Килограммы
    if (
        ['kilogram', 'kilograms', 'kg', 'килограмм', 'килограммы', 'кг'].includes(
            normalized
        )
    ) {
        return 'кг';
    }

    // Миллилитры
    if (
        [
            'milliliter',
            'milliliters',
            'millilitre',
            'millilitres',
            'ml',
            'миллилитр',
            'миллилитры',
            'мл',
        ].includes(normalized)
    ) {
        return 'мл';
    }

    // Литры
    if (
        ['liter', 'liters', 'litre', 'litres', 'l', 'литр', 'литры', 'л'].includes(
            normalized
        )
    ) {
        return 'л';
    }

    // По умолчанию оставляем как есть, чтобы не сломать неожиданные значения
    return unit;
};

