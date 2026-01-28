/**
 * Утилиты для парсинга параметра tgWebAppStartParam.
 *
 * Формат параметра: `{key}_{value}-{key2}_{value2}-...`
 *
 * Примеры:
 * - `restaurantId_123` - только ID ресторана
 * - `utmSource_instagram` - только UTM-метка
 * - `restaurantId_1-utmSource_instagram-utmMedium_social` - комбинированный параметр
 * - `hospitality_heroes` - специальное ключевое слово
 */

/**
 * Типы сущностей, которые поддерживаются для редиректов.
 */
export type EntityType = 'restaurant' | 'event' | 'ticket' | 'certificate' | 'event_city' | 'event_restaurant';

/**
 * Специальные ключевые слова, которые обрабатываются как отдельные команды.
 */
export const SPECIAL_KEYWORDS = ['hospitality_heroes', 'banquet', 'gastronomy', 'certificates', 'booking'] as const;
export type SpecialKeyword = (typeof SPECIAL_KEYWORDS)[number];

/**
 * Результат парсинга параметра tgWebAppStartParam.
 */
export interface ParsedStartParam {
    /**
     * Тип сущности для редиректа (если найден).
     */
    entityType: EntityType | null;

    /**
     * ID сущности для редиректа (если найден).
     */
    entityId: string | null;

    /**
     * Специальное ключевое слово (если найдено).
     */
    specialKeyword: SpecialKeyword | null;

    /**
     * UTM-метки, извлечённые из параметра.
     */
    utmParams: {
        utmSource?: string;
        utmMedium?: string;
        utmCampaign?: string;
        utmTerm?: string;
        utmContent?: string;
    };

    /**
     * Исходный параметр (для обратной совместимости).
     */
    rawParam: string;
}

/**
 * Маппинг ключей из параметра в типы сущностей.
 */
const ENTITY_KEY_MAP: Record<string, EntityType> = {
    restaurantId: 'restaurant',
    eventId: 'event',
    ticketId: 'ticket',
    certificateId: 'certificate',
    event_cityId: 'event_city',
    event_restaurantId: 'event_restaurant',
};

/**
 * Ключи UTM-параметров.
 */
const UTM_KEYS = ['utmSource', 'utmMedium', 'utmCampaign', 'utmTerm', 'utmContent'] as const;

/**
 * Парсит параметр tgWebAppStartParam и извлекает информацию о сущностях и UTM-метках.
 *
 * @param param - Значение параметра tgWebAppStartParam
 * @returns Объект с распарсенными данными
 *
 * @example
 * ```ts
 * parseStartParam('restaurantId_123-utmSource_instagram');
 * // → {
 * //     entityType: 'restaurant',
 * //     entityId: '123',
 * //     specialKeyword: null,
 * //     utmParams: { utmSource: 'instagram' },
 * //     rawParam: 'restaurantId_123-utmSource_instagram'
 * // }
 *
 * parseStartParam('hospitality_heroes');
 * // → {
 * //     entityType: null,
 * //     entityId: null,
 * //     specialKeyword: 'hospitality_heroes',
 * //     utmParams: {},
 * //     rawParam: 'hospitality_heroes'
 * // }
 * ```
 */
export function parseStartParam(param: string | null | undefined): ParsedStartParam {
    const result: ParsedStartParam = {
        entityType: null,
        entityId: null,
        specialKeyword: null,
        utmParams: {},
        rawParam: param ?? '',
    };

    if (!param) {
        return result;
    }

    // Проверяем, является ли параметр специальным ключевым словом (без дополнительных частей)
    if (SPECIAL_KEYWORDS.includes(param as SpecialKeyword)) {
        result.specialKeyword = param as SpecialKeyword;
        return result;
    }

    // Разбиваем параметр на части по разделителю `-`
    const parts = param.split('-');

    for (const part of parts) {
        // Проверяем на специальные ключевые слова в составе комбинированного параметра
        if (SPECIAL_KEYWORDS.includes(part as SpecialKeyword)) {
            result.specialKeyword = part as SpecialKeyword;
            continue;
        }

        // Сначала проверяем, является ли это ключом сущности (ищем паттерн `{entityKey}Id_`)
        let entityFound = false;
        for (const entityKey of Object.keys(ENTITY_KEY_MAP)) {
            const prefix = `${entityKey}_`;
            if (part.startsWith(prefix)) {
                const value = part.substring(prefix.length);
                if (value) {
                    result.entityType = ENTITY_KEY_MAP[entityKey];
                    result.entityId = value;
                    entityFound = true;
                }
                break;
            }
        }
        if (entityFound) {
            continue;
        }

        // Проверяем, является ли это UTM-параметром
        for (const utmKey of UTM_KEYS) {
            const prefix = `${utmKey}_`;
            if (part.startsWith(prefix)) {
                const value = part.substring(prefix.length);
                if (value) {
                    result.utmParams[utmKey as keyof typeof result.utmParams] = value;
                }
                break;
            }
        }
    }

    return result;
}

/**
 * Извлекает только UTM-параметры из строки tgWebAppStartParam.
 *
 * @param param - Значение параметра tgWebAppStartParam
 * @returns Объект с UTM-параметрами
 *
 * @example
 * ```ts
 * extractUtmParams('restaurantId_1-utmSource_instagram-utmMedium_social');
 * // → { utmSource: 'instagram', utmMedium: 'social' }
 * ```
 */
export function extractUtmParams(param: string | null | undefined): ParsedStartParam['utmParams'] {
    return parseStartParam(param).utmParams;
}

/**
 * Извлекает информацию о сущности для редиректа.
 *
 * @param param - Значение параметра tgWebAppStartParam
 * @returns Объект с типом и ID сущности, либо null если сущность не найдена
 *
 * @example
 * ```ts
 * extractEntityInfo('restaurantId_123-utmSource_instagram');
 * // → { entityType: 'restaurant', entityId: '123' }
 *
 * extractEntityInfo('utmSource_instagram');
 * // → null
 * ```
 */
export function extractEntityInfo(
    param: string | null | undefined
): { entityType: EntityType; entityId: string } | null {
    const parsed = parseStartParam(param);
    if (parsed.entityType && parsed.entityId) {
        return {
            entityType: parsed.entityType,
            entityId: parsed.entityId,
        };
    }
    return null;
}

/**
 * Проверяет, является ли параметр специальным ключевым словом.
 *
 * @param param - Значение параметра tgWebAppStartParam
 * @returns Специальное ключевое слово или null
 *
 * @example
 * ```ts
 * getSpecialKeyword('hospitality_heroes');
 * // → 'hospitality_heroes'
 *
 * getSpecialKeyword('restaurantId_123');
 * // → null
 * ```
 */
export function getSpecialKeyword(param: string | null | undefined): SpecialKeyword | null {
    return parseStartParam(param).specialKeyword;
}

/**
 * Конвертирует UTM-параметры в формат для отправки на сервер.
 * Преобразует camelCase ключи в snake_case.
 *
 * @param utmParams - Объект с UTM-параметрами
 * @returns Объект с UTM-параметрами в snake_case формате
 *
 * @example
 * ```ts
 * convertUtmToSnakeCase({ utmSource: 'instagram', utmMedium: 'social' });
 * // → { utm_source: 'instagram', utm_medium: 'social' }
 * ```
 */
export function convertUtmToSnakeCase(utmParams: ParsedStartParam['utmParams']): Record<string, string> {
    const result: Record<string, string> = {};

    if (utmParams.utmSource) result.utm_source = utmParams.utmSource;
    if (utmParams.utmMedium) result.utm_medium = utmParams.utmMedium;
    if (utmParams.utmCampaign) result.utm_campaign = utmParams.utmCampaign;
    if (utmParams.utmTerm) result.utm_term = utmParams.utmTerm;
    if (utmParams.utmContent) result.utm_content = utmParams.utmContent;

    return result;
}
