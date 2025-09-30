import css from './RadioInput.module.css'
import { FC, ReactNode } from 'react';

type Props = {
    title: ReactNode
    checked: boolean
    onChange: () => void
}

export const RadioInput: FC<Props> = ({title, checked, onChange}) => {
    return (
        <label className={css.label}>
            <span>{title}</span>
            <input type={'radio'} checked={checked} onChange={onChange} />
        </label>
    )
}