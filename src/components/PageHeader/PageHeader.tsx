import React from 'react';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import css from '@/components/PageHeader/PageHeader.module.css';
import classNames from 'classnames';

interface IPageHeaderProps {
    title: string;
    goBack: () => void;
    spacer?: boolean;
    className?: string;
}

export const PageHeader: React.FC<IPageHeaderProps> = ({ title, goBack, spacer = true, className }): JSX.Element => {
    return (
        <header className={classNames(css.header, className)}>
            <RoundedButton icon={<BackIcon size={24} color={'var(--dark-grey)'} />} action={goBack} />
            <HeaderContent className={css.headerTitle} title={title} fontSize={14} />
            {spacer && <div className={css.spacer} />}
        </header>
    );
};