import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
// Styles
import css from '@/components/OptionsNavigation/OptionsNavigationElement/OptionsNavigationElement.module.css';

interface OptionsNavigationElementProps {
    title: string;
    subtitle?: string;
    img?: string;
    link: string;
    locationState?: object;
    className?: string;
    textWrapperClassName?: string;
}

export const OptionsNavigationElement: React.FC<OptionsNavigationElementProps> = ({
    title,
    subtitle,
    img,
    link,
    locationState,
    className,
    textWrapperClassName,
}) => {
    return (
        <Link
            to={link}
            className={classNames(css.element, className)}
            style={{ backgroundImage: `url(${img})` }}
            state={locationState}
        >
            <div className={css.wrapper}>
                <div className={classNames(css.textWrapper, textWrapperClassName)}>
                    <span className={css.title}>{title}</span>
                    {subtitle && <span className={css.subtitle}>{subtitle}</span>}
                </div>
                <div className={css.separator} />
            </div>
        </Link>
    );
};
