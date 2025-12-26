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
    
    const normalizedText = text.toLowerCase().trim();
    const normalizedQuery = query.toLowerCase().trim();
    
    // Для очень коротких запросов (1-2 символа) используем только точное совпадение
    if (normalizedQuery.length <= 2) {
        // Проверяем точное совпадение в начале слова или как отдельное слово
        const words = normalizedText.split(/\s+/);
        return words.some(word => word.startsWith(normalizedQuery) || word === normalizedQuery);
    }
    
    // Если есть точное совпадение подстроки, сразу возвращаем true
    if (normalizedText.includes(normalizedQuery)) {
        return true;
    }
    
    // Для запросов длиной 3 символа используем более строгий порог
    const effectiveThreshold = normalizedQuery.length === 3 ? Math.max(threshold, 0.5) : threshold;
    
    // Разбиваем текст и запрос на слова
    const textWords = normalizedText.split(/\s+/).filter(w => w.length > 0);
    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
    
    // Если запрос состоит из одного слова, проверяем более строго
    if (queryWords.length === 1) {
        const queryWord = queryWords[0];
        
        // Сначала проверяем начало слова (более точное совпадение)
        for (const textWord of textWords) {
            if (textWord.startsWith(queryWord)) {
                return true;
            }
        }
        
        // Затем проверяем триграмную схожесть с более высоким порогом для одного слова
        const singleWordThreshold = Math.max(effectiveThreshold, 0.45);
        for (const textWord of textWords) {
            const similarity = trigramSimilarity(textWord, queryWord);
            if (similarity >= singleWordThreshold) {
                return true;
            }
        }
        
        return false;
    }
    
    // Для многословных запросов проверяем каждое слово
    for (const queryWord of queryWords) {
        // Пропускаем очень короткие слова (меньше 2 символов)
        if (queryWord.length < 2) continue;
        
        let found = false;
        
        // Сначала проверяем начало слова
        for (const textWord of textWords) {
            if (textWord.startsWith(queryWord)) {
                found = true;
                break;
            }
        }
        
        // Если не найдено по началу, проверяем триграмную схожесть
        if (!found) {
            for (const textWord of textWords) {
                const similarity = trigramSimilarity(textWord, queryWord);
                // Для многословных запросов используем более строгий порог
                const wordThreshold = queryWord.length <= 3 ? Math.max(effectiveThreshold, 0.5) : effectiveThreshold;
                if (similarity >= wordThreshold) {
                    found = true;
                    break;
                }
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

