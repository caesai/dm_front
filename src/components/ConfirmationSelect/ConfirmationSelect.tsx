import React, { Dispatch, ReactNode, SetStateAction, useState } from 'react';
import classNames from 'classnames';
// Types
import { IConfirmationType } from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';
// Icons
import { DownArrow } from '@/components/Icons/DownArrow.tsx';
// Components
import { Collapse } from 'react-collapse';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
// Styles
import css from '@/components/ConfirmationSelect/ConfirmationSelect.module.css';

/**
 * Пропсы компонента ConfirmationSelect.
 * @interface IConfirmationSelectProps
 */
export interface IConfirmationSelectProps {
    options: IConfirmationType[];
    currentValue: IConfirmationType;
    onChange: Dispatch<SetStateAction<IConfirmationType>>;
    title?: ReactNode;
}

/**
 * Компонент селектора способа подтверждения
 * @param {IConfirmationSelectProps} props
 * @returns {JSX.Element}
 */
export const ConfirmationSelect: React.FC<IConfirmationSelectProps> = ({
    options,
    currentValue,
    onChange,
    title,
}: IConfirmationSelectProps): JSX.Element => {
    const [collapse, setCollapse] = useState(false);
    const selectOnChange = (id: string, text: string) => {
        const newValue: IConfirmationType = {
            id: id,
            text: text,
        };
        onChange(newValue);
        setCollapse((prev) => !prev);
    };

    return (
        <ContentContainer>
            <HeaderContainer>
                <HeaderContent title="Способ подтверждения" />
            </HeaderContainer>
            <ContentBlock className={classNames(css.selectWrapper)}>
                <div className={css.select} onClick={() => setCollapse((prev) => !prev)}>
                    <div className={css.textWrap}>
                        <span className={css.title}>{title ? title : 'Способ подтверждения'}</span>
                        <span className={css.currentValue}>{currentValue.text}</span>
                    </div>
                    <div className={classNames(css.arrow, { [css.arrow__active]: !collapse })}>
                        <DownArrow color={'var(--grey)'} size={16}></DownArrow>
                    </div>
                </div>
                <Collapse isOpened={collapse}>
                    <ContentBlock className={classNames(css.optionWrapper)}>
                        {options
                            .filter((v) => v.id !== currentValue.id)
                            .map((v) => (
                                <div key={v.id} className={css.option} onClick={() => selectOnChange(v.id, v.text)}>
                                    <span className={css.option_title}>{v.text}</span>
                                    <div
                                        className={classNames(
                                            css.option_checkbox,
                                            { [css.option_checkbox__checked]: currentValue.id == v.id },
                                        )}
                                    ></div>
                                </div>
                            ))}
                    </ContentBlock>
                </Collapse>
            </ContentBlock>
        </ContentContainer>
    );
};
