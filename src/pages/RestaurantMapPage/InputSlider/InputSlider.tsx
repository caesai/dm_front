import css from './InputSlider.module.css';
import { FC } from 'react';

interface InputItem {
    id: string;
    value: string;
}

interface IInputSlider {
    itemsList: InputItem[];
    state: string;
    setState: (state: string) => void;
}

export const InputSlider: FC<IInputSlider> = (p) => {
    return (
        <div className={css.planSwitch}>
            {p.itemsList.map((item, index) => (
                <>
                    <input
                        key={index}
                        type="radio"
                        name="plan"
                        id={item.id}
                        checked={p.state == item.id}
                        onChange={() => p.setState(item.id)}
                    />
                    <label htmlFor={item.id}>{item.value}</label>
                </>
            ))}
            <div className={css.indicator}></div>
        </div>
    );
};
