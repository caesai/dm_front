import { FC, useRef, ReactNode, useState, useEffect } from 'react';
import css from './InputWithIcon.module.css';
import classNames from 'classnames';

interface ITextInput {
    placeholder?: string;
    icon?: ReactNode;
    value: string | undefined;
    onChange: (value: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    validation_failed?: boolean;
}

export const TimeInput: FC<ITextInput> = (p) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [displayValue, setDisplayValue] = useState('');

    const formatTime = (input: string): string => {
        const numbers = input.replace(/\D/g, '');
        const limited = numbers.slice(0, 4);

        if (limited.length <= 2) {
            return limited;
        } else {
            const hours = limited.slice(0, 2);
            const minutes = limited.slice(2);
            return `${hours}:${minutes}`;
        }
    };

    // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const input = e.target.value;
    //     if (input.length === 3 && displayValue.length === 5 && input.includes(':')) {
    //         const numbers = input.replace(/\D/g, '');
    //         setDisplayValue(numbers);
    //         p.onChange(numbers);
    //         return;
    //     }
    //
    //     const formatted = formatTime(input);
    //     setDisplayValue(formatted);
    //     if (formatted.replace(/\D/g, '').length === 4) {
    //         p.onChange(formatted);
    //     } else {
    //         p.onChange(formatted);
    //     }
    // };

    useEffect(() => {
        if (p.value) {
            if (p.value.length === 4 && !p.value.includes(':')) {
                const formatted = formatTime(p.value);
                setDisplayValue(formatted);
            } else {
                setDisplayValue(p.value);
            }
        } else {
            setDisplayValue('');
        }
    }, [p.value]);

    return (
        <div className={css.input_container}>
            {p.icon && (
                <div className={css.icon}>
                    {p.icon}
                </div>
            )}
            <input
                type={'text'}
                placeholder={p.placeholder}
                value={displayValue}
                onFocus={p.onFocus}
                onBlur={p.onBlur}
                onChange={(e) => e.preventDefault()}
                className={classNames(
                    css.text_input,
                    p.validation_failed ? css.failed : null,
                    p.icon ? css.with_icon : null
                )}
                ref={inputRef}
            />
        </div>
    );
};
