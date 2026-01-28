import {
    parseStartParam,
    extractUtmParams,
    extractEntityInfo,
    getSpecialKeyword,
    convertUtmToSnakeCase,
} from '@/utils/startParam.utils';

describe('startParam.utils', () => {
    describe('parseStartParam', () => {
        it('должен вернуть пустой результат для null или undefined', () => {
            expect(parseStartParam(null)).toEqual({
                entityType: null,
                entityId: null,
                specialKeyword: null,
                utmParams: {},
                rawParam: '',
            });

            expect(parseStartParam(undefined)).toEqual({
                entityType: null,
                entityId: null,
                specialKeyword: null,
                utmParams: {},
                rawParam: '',
            });
        });

        it('должен распознать специальное ключевое слово hospitality_heroes', () => {
            const result = parseStartParam('hospitality_heroes');
            expect(result.specialKeyword).toBe('hospitality_heroes');
            expect(result.entityType).toBeNull();
            expect(result.entityId).toBeNull();
        });

        it('должен распознать специальное ключевое слово banquet', () => {
            const result = parseStartParam('banquet');
            expect(result.specialKeyword).toBe('banquet');
        });

        it('должен распознать специальное ключевое слово gastronomy', () => {
            const result = parseStartParam('gastronomy');
            expect(result.specialKeyword).toBe('gastronomy');
        });

        it('должен распознать специальное ключевое слово certificates', () => {
            const result = parseStartParam('certificates');
            expect(result.specialKeyword).toBe('certificates');
        });

        it('должен распознать специальное ключевое слово booking', () => {
            const result = parseStartParam('booking');
            expect(result.specialKeyword).toBe('booking');
        });

        it('должен извлечь restaurantId', () => {
            const result = parseStartParam('restaurantId_123');
            expect(result.entityType).toBe('restaurant');
            expect(result.entityId).toBe('123');
            expect(result.specialKeyword).toBeNull();
        });

        it('должен извлечь eventId', () => {
            const result = parseStartParam('eventId_456');
            expect(result.entityType).toBe('event');
            expect(result.entityId).toBe('456');
        });

        it('должен извлечь ticketId', () => {
            const result = parseStartParam('ticketId_789');
            expect(result.entityType).toBe('ticket');
            expect(result.entityId).toBe('789');
        });

        it('должен извлечь certificateId', () => {
            const result = parseStartParam('certificateId_abc');
            expect(result.entityType).toBe('certificate');
            expect(result.entityId).toBe('abc');
        });

        it('должен извлечь event_cityId', () => {
            const result = parseStartParam('event_cityId_10');
            expect(result.entityType).toBe('event_city');
            expect(result.entityId).toBe('10');
        });

        it('должен извлечь event_restaurantId', () => {
            const result = parseStartParam('event_restaurantId_20');
            expect(result.entityType).toBe('event_restaurant');
            expect(result.entityId).toBe('20');
        });

        it('должен извлечь UTM-параметры', () => {
            const result = parseStartParam('utmSource_instagram-utmMedium_social-utmCampaign_summer');
            expect(result.utmParams).toEqual({
                utmSource: 'instagram',
                utmMedium: 'social',
                utmCampaign: 'summer',
            });
            expect(result.entityType).toBeNull();
            expect(result.entityId).toBeNull();
        });

        it('должен извлечь все UTM-параметры', () => {
            const result = parseStartParam(
                'utmSource_google-utmMedium_cpc-utmCampaign_promo-utmTerm_keywords-utmContent_banner'
            );
            expect(result.utmParams).toEqual({
                utmSource: 'google',
                utmMedium: 'cpc',
                utmCampaign: 'promo',
                utmTerm: 'keywords',
                utmContent: 'banner',
            });
        });

        it('должен извлечь entityId и UTM-параметры из комбинированного параметра', () => {
            const result = parseStartParam('restaurantId_1-utmSource_instagram-utmMedium_social');
            expect(result.entityType).toBe('restaurant');
            expect(result.entityId).toBe('1');
            expect(result.utmParams).toEqual({
                utmSource: 'instagram',
                utmMedium: 'social',
            });
        });

        it('должен сохранять исходный параметр в rawParam', () => {
            const param = 'restaurantId_123-utmSource_instagram';
            const result = parseStartParam(param);
            expect(result.rawParam).toBe(param);
        });

        it('должен игнорировать некорректные части параметра', () => {
            const result = parseStartParam('restaurantId_123-invalidPart-utmSource_instagram');
            expect(result.entityType).toBe('restaurant');
            expect(result.entityId).toBe('123');
            expect(result.utmParams).toEqual({
                utmSource: 'instagram',
            });
        });

        it('должен обрабатывать пустые значения', () => {
            const result = parseStartParam('restaurantId_-utmSource_');
            expect(result.entityType).toBeNull();
            expect(result.entityId).toBeNull();
            expect(result.utmParams).toEqual({});
        });
    });

    describe('extractUtmParams', () => {
        it('должен вернуть только UTM-параметры', () => {
            const result = extractUtmParams('restaurantId_1-utmSource_instagram-utmMedium_social');
            expect(result).toEqual({
                utmSource: 'instagram',
                utmMedium: 'social',
            });
        });

        it('должен вернуть пустой объект если UTM-параметров нет', () => {
            const result = extractUtmParams('restaurantId_123');
            expect(result).toEqual({});
        });
    });

    describe('extractEntityInfo', () => {
        it('должен вернуть информацию о сущности', () => {
            const result = extractEntityInfo('restaurantId_123-utmSource_instagram');
            expect(result).toEqual({
                entityType: 'restaurant',
                entityId: '123',
            });
        });

        it('должен вернуть null если сущность не найдена', () => {
            const result = extractEntityInfo('utmSource_instagram');
            expect(result).toBeNull();
        });

        it('должен вернуть null для специального ключевого слова', () => {
            const result = extractEntityInfo('hospitality_heroes');
            expect(result).toBeNull();
        });
    });

    describe('getSpecialKeyword', () => {
        it('должен вернуть специальное ключевое слово', () => {
            expect(getSpecialKeyword('hospitality_heroes')).toBe('hospitality_heroes');
            expect(getSpecialKeyword('gastronomy')).toBe('gastronomy');
        });

        it('должен вернуть null для обычного параметра', () => {
            expect(getSpecialKeyword('restaurantId_123')).toBeNull();
        });
    });

    describe('convertUtmToSnakeCase', () => {
        it('должен преобразовать UTM-параметры в snake_case', () => {
            const result = convertUtmToSnakeCase({
                utmSource: 'instagram',
                utmMedium: 'social',
                utmCampaign: 'summer',
                utmTerm: 'keywords',
                utmContent: 'banner',
            });
            expect(result).toEqual({
                utm_source: 'instagram',
                utm_medium: 'social',
                utm_campaign: 'summer',
                utm_term: 'keywords',
                utm_content: 'banner',
            });
        });

        it('должен пропускать undefined значения', () => {
            const result = convertUtmToSnakeCase({
                utmSource: 'instagram',
            });
            expect(result).toEqual({
                utm_source: 'instagram',
            });
        });

        it('должен вернуть пустой объект для пустого входа', () => {
            const result = convertUtmToSnakeCase({});
            expect(result).toEqual({});
        });
    });
});
