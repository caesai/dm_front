/**
 * @fileoverview Тесты для утилит работы с меню.
 * 
 * Утилиты menu.utils содержат функции для работы с ценами и единицами измерения блюд.
 * Эти функции критичны для правильного отображения цен и размеров в интерфейсе.
 * 
 * Тесты покрывают:
 * - Извлечение цены из различных форматов данных API
 * - Получение дефолтного размера блюда
 * - Форматирование единиц измерения
 * - Граничные случаи и обработку ошибок
 * 
 * @module __tests__/utils/menu.utils
 * 
 * @see {@link menu.utils} - тестируемые утилиты
 */

import {
    extractPrice,
    getDefaultSize,
    formatMeasureUnitType,
} from '@/utils/menu.utils.ts';

describe('menu.utils', () => {
    describe('extractPrice', () => {
        it('должен извлечь цену из массива с одним объектом', () => {
            const prices = [{ weight_500: 1000 }];
            expect(extractPrice(prices)).toBe(1000);
        });

        it('должен извлечь цену из массива с несколькими объектами (берет первый)', () => {
            const prices = [
                { weight_500: 1000 },
                { weight_1000: 2000 },
            ];
            expect(extractPrice(prices)).toBe(1000);
        });

        it('должен извлечь цену из вложенного объекта с value', () => {
            const prices = [{ weight_500: { value: 1500 } }];
            expect(extractPrice(prices)).toBe(1500);
        });

        it('должен извлечь цену из вложенного объекта с price', () => {
            const prices = [{ weight_500: { price: 1200 } }];
            expect(extractPrice(prices)).toBe(1200);
        });

        it('должен извлечь цену из вложенного объекта с amount', () => {
            const prices = [{ weight_500: { amount: 1300 } }];
            expect(extractPrice(prices)).toBe(1300);
        });

        it('должен вернуть 0 для пустого массива', () => {
            expect(extractPrice([])).toBe(0);
        });

        it('должен вернуть 0 для undefined', () => {
            expect(extractPrice(undefined)).toBe(0);
        });

        it('должен вернуть 0 для null', () => {
            expect(extractPrice(null as any)).toBe(0);
        });

        it('должен вернуть 0 для пустого объекта', () => {
            const prices = [{}];
            expect(extractPrice(prices)).toBe(0);
        });

        it('должен вернуть 0 для объекта без числовых значений', () => {
            const prices = [{ weight_500: 'not a number' }];
            expect(extractPrice(prices)).toBe(0);
        });

        it('должен вернуть 0 для вложенного объекта без value/price/amount', () => {
            const prices = [{ weight_500: { other: 1000 } }];
            expect(extractPrice(prices)).toBe(0);
        });

        it('должен обработать нулевую цену', () => {
            const prices = [{ weight_500: 0 }];
            expect(extractPrice(prices)).toBe(0);
        });

        it('должен обработать отрицательную цену', () => {
            const prices = [{ weight_500: -100 }];
            expect(extractPrice(prices)).toBe(-100);
        });
    });

    describe('getDefaultSize', () => {
        interface TestSize {
            id: number;
            is_default?: boolean;
            name: string;
        }

        it('должен вернуть размер с флагом is_default', () => {
            const sizes: TestSize[] = [
                { id: 1, name: 'Small', is_default: false },
                { id: 2, name: 'Medium', is_default: true },
                { id: 3, name: 'Large', is_default: false },
            ];

            const result = getDefaultSize(sizes);
            expect(result).toEqual({ id: 2, name: 'Medium', is_default: true });
        });

        it('должен вернуть первый элемент, если нет размера с is_default', () => {
            const sizes: TestSize[] = [
                { id: 1, name: 'Small' },
                { id: 2, name: 'Medium' },
                { id: 3, name: 'Large' },
            ];

            const result = getDefaultSize(sizes);
            expect(result).toEqual({ id: 1, name: 'Small' });
        });

        it('должен вернуть первый элемент, если несколько размеров с is_default', () => {
            const sizes: TestSize[] = [
                { id: 1, name: 'Small', is_default: true },
                { id: 2, name: 'Medium', is_default: true },
            ];

            const result = getDefaultSize(sizes);
            expect(result).toEqual({ id: 1, name: 'Small', is_default: true });
        });

        it('должен вернуть undefined для пустого массива', () => {
            const sizes: TestSize[] = [];
            const result = getDefaultSize(sizes);
            expect(result).toBeUndefined();
        });

        it('должен вернуть первый элемент для массива с одним элементом', () => {
            const sizes: TestSize[] = [{ id: 1, name: 'Only' }];
            const result = getDefaultSize(sizes);
            expect(result).toEqual({ id: 1, name: 'Only' });
        });
    });

    describe('formatMeasureUnitType', () => {
        describe('Граммы', () => {
            it('должен форматировать "GRAM" в "г"', () => {
                expect(formatMeasureUnitType('GRAM')).toBe('г');
            });

            it('должен форматировать "GRAMS" в "г"', () => {
                expect(formatMeasureUnitType('GRAMS')).toBe('г');
            });

            it('должен форматировать "g" в "г"', () => {
                expect(formatMeasureUnitType('g')).toBe('г');
            });

            it('должен форматировать "грамм" в "г"', () => {
                expect(formatMeasureUnitType('грамм')).toBe('г');
            });

            it('должен форматировать "Г" в "г" (регистронезависимо)', () => {
                expect(formatMeasureUnitType('Г')).toBe('г');
            });
        });

        describe('Килограммы', () => {
            it('должен форматировать "KILOGRAM" в "кг"', () => {
                expect(formatMeasureUnitType('KILOGRAM')).toBe('кг');
            });

            it('должен форматировать "KG" в "кг"', () => {
                expect(formatMeasureUnitType('KG')).toBe('кг');
            });

            it('должен форматировать "килограмм" в "кг"', () => {
                expect(formatMeasureUnitType('килограмм')).toBe('кг');
            });
        });

        describe('Миллилитры', () => {
            it('должен форматировать "MILLILITER" в "мл"', () => {
                expect(formatMeasureUnitType('MILLILITER')).toBe('мл');
            });

            it('должен форматировать "ML" в "мл"', () => {
                expect(formatMeasureUnitType('ML')).toBe('мл');
            });

            it('должен форматировать "миллилитр" в "мл"', () => {
                expect(formatMeasureUnitType('миллилитр')).toBe('мл');
            });

            it('должен форматировать "millilitre" в "мл"', () => {
                expect(formatMeasureUnitType('millilitre')).toBe('мл');
            });
        });

        describe('Литры', () => {
            it('должен форматировать "LITER" в "л"', () => {
                expect(formatMeasureUnitType('LITER')).toBe('л');
            });

            it('должен форматировать "L" в "л"', () => {
                expect(formatMeasureUnitType('L')).toBe('л');
            });

            it('должен форматировать "литр" в "л"', () => {
                expect(formatMeasureUnitType('литр')).toBe('л');
            });

            it('должен форматировать "litre" в "л"', () => {
                expect(formatMeasureUnitType('litre')).toBe('л');
            });
        });

        describe('Граничные случаи', () => {
            it('должен вернуть пустую строку для undefined', () => {
                expect(formatMeasureUnitType(undefined)).toBe('');
            });

            it('должен вернуть пустую строку для null', () => {
                expect(formatMeasureUnitType(null)).toBe('');
            });

            it('должен вернуть пустую строку для пустой строки', () => {
                expect(formatMeasureUnitType('')).toBe('');
            });

            it('должен обрезать пробелы', () => {
                expect(formatMeasureUnitType('  GRAM  ')).toBe('г');
            });

            it('должен вернуть исходное значение для неизвестной единицы', () => {
                expect(formatMeasureUnitType('UNKNOWN_UNIT')).toBe('UNKNOWN_UNIT');
            });

            it('должен вернуть исходное значение для "шт" (штуки)', () => {
                expect(formatMeasureUnitType('шт')).toBe('шт');
            });

            it('должен вернуть исходное значение для "piece"', () => {
                expect(formatMeasureUnitType('piece')).toBe('piece');
            });
        });

        describe('Регистронезависимость', () => {
            it('должен обрабатывать разные регистры для граммов', () => {
                expect(formatMeasureUnitType('gram')).toBe('г');
                expect(formatMeasureUnitType('GRAM')).toBe('г');
                expect(formatMeasureUnitType('Gram')).toBe('г');
            });

            it('должен обрабатывать разные регистры для килограммов', () => {
                expect(formatMeasureUnitType('kilogram')).toBe('кг');
                expect(formatMeasureUnitType('KILOGRAM')).toBe('кг');
                expect(formatMeasureUnitType('Kilogram')).toBe('кг');
            });
        });
    });
});
