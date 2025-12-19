/**
 * Извлекает цену из массива prices API ответа
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

