import React, { useRef, useCallback } from 'react';
import classNames from 'classnames';
// Styles
import css from '@/components/TextInput/TextInput.module.css';

/**
 * Пропсы компонента TextInput
 * @interface ITextInputProps
 */
interface ITextInputProps {
    /** Плейсхолдер */
    placeholder?: string;
    /** Значение */
    value: string | undefined;
    /** Функция для обработки изменения значения */
    onChange: (value: string) => void;
    /** Функция для обработки фокуса */
    onFocus?: () => void;
    /** Функция для обработки фокуса */
    onBlur?: () => void;
    /** Флаг для обработки ошибки валидации */
    validation_failed?: boolean;
    /** Флаг для обработки отключения */
    disabled?: boolean;
    /** Флаг для обработки обязательности */
    required?: boolean;
    /** Тип ввода */
    type?: 'text' | 'tel' | 'email' | 'password';
    /** Флаг для обработки textarea */
    textarea?: boolean;
    /** Количество строк */
    rows?: number;
}
/**
 * Компонент TextInput для ввода текста
 * @param {ITextInputProps} props - свойства компонента
 * @returns {JSX.Element} компонент TextInput
 */
export const TextInput: React.FC<ITextInputProps> = ({
    placeholder,
    value,
    onChange,
    onFocus,
    onBlur,
    disabled,
    required,
    validation_failed,
    type = 'text',
    textarea = false,
    rows = 1,
}: ITextInputProps): JSX.Element => {
    const inputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let newValue = e.target.value;

        // Для телефона разрешаем только цифры, +, -, пробелы и скобки
        if (type === 'tel') {
            newValue = newValue.replace(/[^\d+\-\s()]/g, '');
        }

        onChange(newValue);
    };

    // Прокрутка элемента в видимую область при фокусе (для мобильных устройств)
    const handleFocus = useCallback(() => {
        const ref = textarea ? textareaRef : inputRef;
        // Задержка для появления виртуальной клавиатуры
        setTimeout(() => {
            ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 300);
        onFocus?.();
    }, [textarea, onFocus]);
    return (
        <>
            {textarea ? (
                <textarea
                    placeholder={placeholder}
                    value={value}
                    onFocus={handleFocus}
                    onBlur={onBlur}
                    disabled={disabled}
                    required={required}
                    onChange={handleChange}
                    className={classNames(css.text_input, validation_failed ? css.failed : null)}
                    ref={textareaRef}
                    role={'textarea'}
                    rows={rows}
                />
            ) : (
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onFocus={handleFocus}
                    onBlur={onBlur}
                    disabled={disabled}
                    required={required}
                    onChange={handleChange}
                    className={classNames(css.text_input, validation_failed ? css.failed : null)}
                    ref={inputRef}
                    role={'textbox'}
                />
            )}
        </>
    );
};
