import React, { useRef } from 'react';
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
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onFocus={onFocus}
            onBlur={onBlur}
            disabled={disabled}
            onChange={handleChange}
            className={classNames(css.text_input, validation_failed ? css.failed : null)}
            ref={inputRef}
            role={'textbox'}
        />
    );
};
