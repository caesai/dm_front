import React, { CSSProperties, useCallback, useMemo, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
// UI
import { Collapse } from 'react-collapse';
import classNames from 'classnames';
// Icons
import { DownArrow } from '@/components/Icons/DownArrow.tsx';
// Atoms
import { cityListAtom, getCurrentCity, setCurrentCityAtom, type ICity } from '@/atoms/cityListAtom.ts';
// CSS
import css from '@/components/CitySelect/CitySelect.module.css';

/**
 * Пропсы компонента CitySelect.
 *
 * @interface ICitySelectProps
 */
interface ICitySelectProps {
    /**
     * Кастомные стили для отображаемого названия города.
     */
    titleStyle?: CSSProperties;
    /**
     * Список городов для фильтрации.
     */
    filteredCitiesList?: ICity[];
}

/**
 * Компонент выпадающего списка для выбора города.
 *
 * Особенности:
 * - Напрямую работает с Jotai атомами без дублирования состояния
 * - Использует анимированный collapse для плавного раскрытия/скрытия списка
 * - Автоматически исключает текущий город из списка опций
 *
 * @component
 * @example
 * // Базовое использование
 * // filteredCitiesList - список городов для фильтрации (необязательно)
 * // titleStyle - стили для названия города (необязательно)
 * <CitySelect filteredCitiesList={filteredCitiesList} titleStyle={titleStyle}/>
 *
 * @example
 * // С кастомными стилями названия
 * <CitySelect titleStyle={{ fontSize: '18px', fontWeight: 'bold' }} filteredCitiesList={filteredCitiesList}/>
 *
 * @param {ICitySelectProps} props - Пропсы компонента
 * @returns {JSX.Element} Выпадающий список выбора города
 */
export const CitySelect: React.FC<ICitySelectProps> = ({ titleStyle, filteredCitiesList }: ICitySelectProps): JSX.Element => {
    const [isOpen, setIsOpen] = useState(false);

    // Атомы: чтение списка городов и текущего города
    const cityList = useAtomValue(cityListAtom);
    const currentCity = useAtomValue(getCurrentCity);
    const setCurrentCity = useSetAtom(setCurrentCityAtom);

    /**
     * Список городов для отображения в выпадающем списке.
     * Исключает текущий выбранный город.
     */
    const availableCities = useMemo(
        () => filteredCitiesList ? filteredCitiesList : cityList.filter((city) => city.name_english !== currentCity.name_english),
        [cityList, currentCity.name_english, filteredCitiesList]
    );

    /**
     * Переключает состояние выпадающего списка.
     */
    const toggleDropdown = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    /**
     * Обработчик выбора города из выпадающего списка.
     * Обновляет глобальное состояние и закрывает список.
     *
     * @param {ICity} city - Выбранный город
     */
    const handleCitySelect = useCallback((city: ICity) => {
        setCurrentCity(city.name_english);
        setIsOpen(false);
    }, [setCurrentCity]);
    
    return (
        <div className={css.selectWrapper}>
            <div className={css.select} onClick={toggleDropdown}>
                <div className={css.textWrap}>
                    <span className={css.currentValue} style={titleStyle}>
                        {currentCity.name}
                    </span>
                </div>
                <div className={classNames(css.arrow, !isOpen && css.arrow__active)}>
                    <DownArrow color={'var(--grey)'} size={16} />
                </div>
            </div>
            <Collapse isOpened={isOpen}>
                <div className={css.optionWrapper}>
                    {availableCities.map((city) => (
                        <div
                            key={city.name_english}
                            className={css.option}
                            onClick={() => handleCitySelect(city)}
                        >
                            <span className={css.option_title}>{city.name}</span>
                        </div>
                    ))}
                </div>
            </Collapse>
        </div>
    );
};
