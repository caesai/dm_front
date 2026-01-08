import React from 'react';
import css from '@/components/ContentBlock/ContentBlock.module.css';

interface IHeaderSubTextProps {
    text: React.ReactNode;
    id?: string;
}

export const HeaderSubText: React.FC<IHeaderSubTextProps> = ({ text, id }): JSX.Element => {
    return <span className={css.headerSubText} id={id}>{text}</span>;
};
