import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
// Styles
import css from '@/components/OptionsNavigation/OptionsNavigationElement/OptionsNavigationElement.module.css';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';

interface OptionsNavigationElementProps {
    title: string;
    img?: string;
    link: string;
    locationState?: object;
    className?: string;
}

export const OptionsNavigationElement: React.FC<OptionsNavigationElementProps> = ({
    title,
    img,
    link,
    locationState,
    className,
}) => {
    return (
        <Link
            to={link}
            className={classNames(css.wrapper, className)}
            state={locationState}
        >
            <ContentBlock className={css.icon}>
                <img src={img} alt="" />
            </ContentBlock>
            <span className={css.title}>{title}</span>
        </Link>
    );
};
