import React, { useRef, useCallback } from 'react';
import classNames from 'classnames';
// Styles
import css from '@/components/TextInput/TextInput.module.css';

interface ITextInputProps {
    placeholder?: string;
    value: string | undefined;
    onChange: (value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    validation_failed?: boolean;
    disabled?: boolean;
    type?: 'text' | 'tel' | 'email' | 'password';
    textarea?: boolean;
    rows?: number;
}

export const TextInput: React.FC<ITextInputProps> = ({
    placeholder,
    value,
    onChange,
    onFocus,
    onBlur,
    disabled,
    validation_failed,
    type = 'text',
    textarea = false,
    rows = 1,
}) => {
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
                    onChange={handleChange}
                    className={classNames(css.text_input, validation_failed ? css.failed : null)}
                    ref={inputRef}
                    role={'textbox'}
                />
            )}
        </>
    );
};
