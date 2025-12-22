/**
 * Создает набор триграмм из строки
 * @param str - Входная строка
 * @returns Set триграмм
 */
const getTrigrams = (str: string): Set<string> => {
    const normalized = str.toLowerCase().trim();
    const trigrams = new Set<string>();
    
    if (normalized.length < 3) {
        trigrams.add(normalized);
        return trigrams;
    }
    
    // Добавляем пробелы в начало и конец для лучшего поиска по краям слов
    const padded = `  ${normalized}  `;
    
    for (let i = 0; i < padded.length - 2; i++) {
        trigrams.add(padded.substring(i, i + 3));
    }
    
    return trigrams;
};

/**
 * Вычисляет коэффициент схожести двух строк на основе триграмм (коэффициент Дайса)
 * @param str1 - Первая строка
 * @param str2 - Вторая строка
 * @returns Коэффициент схожести от 0 до 1
 */
export const trigramSimilarity = (str1: string, str2: string): number => {
    if (!str1 || !str2) return 0;
    
    const trigrams1 = getTrigrams(str1);
    const trigrams2 = getTrigrams(str2);
    
    if (trigrams1.size === 0 && trigrams2.size === 0) return 1;
    if (trigrams1.size === 0 || trigrams2.size === 0) return 0;
    
    // Подсчитываем количество общих триграмм
    let intersection = 0;
    trigrams1.forEach(trigram => {
        if (trigrams2.has(trigram)) {
            intersection++;
        }
    });
    
    // Коэффициент Дайса: 2 * |A ∩ B| / (|A| + |B|)
    return (2 * intersection) / (trigrams1.size + trigrams2.size);
};

/**
 * Проверяет, соответствует ли строка поисковому запросу с использованием триграммного поиска
 * @param text - Текст для поиска
 * @param query - Поисковый запрос
 * @param threshold - Минимальный порог схожести (по умолчанию 0.3)
 * @returns true, если текст соответствует запросу
 */
export const trigramMatch = (text: string, query: string, threshold: number = 0.3): boolean => {
    if (!query.trim()) return true;
    if (!text) return false;
    
    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase().trim();
    
    // Если есть точное совпадение подстроки, сразу возвращаем true
    if (normalizedText.includes(normalizedQuery)) {
        return true;
    }
    
    // Разбиваем текст и запрос на слова
    const textWords = normalizedText.split(/\s+/);
    const queryWords = normalizedQuery.split(/\s+/);
    
    // Проверяем каждое слово запроса
    for (const queryWord of queryWords) {
        let found = false;
        
        // Проверяем схожесть с каждым словом текста
        for (const textWord of textWords) {
            const similarity = trigramSimilarity(textWord, queryWord);
            if (similarity >= threshold) {
                found = true;
                break;
            }
        }
        
        // Если хотя бы одно слово запроса не найдено, возвращаем false
        if (!found) {
            return false;
        }
    }
    
    return true;
};

/**
 * Фильтрует массив объектов по поисковому запросу с использованием триграммного поиска
 * @param items - Массив объектов для фильтрации
 * @param query - Поисковый запрос
 * @param getSearchableText - Функция для извлечения текста для поиска из объекта
 * @param threshold - Минимальный порог схожести
 * @returns Отфильтрованный массив
 */
export const trigramFilter = <T>(
    items: T[],
    query: string,
    getSearchableText: (item: T) => string,
    threshold: number = 0.3
): T[] => {
    if (!query.trim()) return items;
    
    return items.filter(item => {
        const text = getSearchableText(item);
        return trigramMatch(text, query, threshold);
    });
};

