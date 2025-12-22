import React,{ ReactNode } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
// Components
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
// Styles
import css from '@/components/OptionsNavigation/OptionsNavigationElement/OptionsNavigationElement.module.css';

interface OptionsNavigationElementProps {
    icon?: ReactNode;
    title: string;
    subtitle?: string;
    img?: string;
    link?: string;
    onClick?: () => void;
    locationState?: object;
    className?: string;
    textWrapperClassName?: string;
    isLoading?: boolean;
}

export const OptionsNavigationElement: React.FC<OptionsNavigationElementProps> = (
    { icon, title, subtitle, img, link, onClick, locationState, className, textWrapperClassName, isLoading }
) => {
    if (isLoading) {
        return (
            <div className={css.element}>
                <PlaceholderBlock width="100%" height="48px" rounded="16px" />
            </div>
        );
    }
    return link ? (
        <Link to={link} className={classNames(css.element, className)} style={{ backgroundImage: `url(${img})` }} state={locationState}>
            <div className={css.wrapper}>
                <div className={classNames(css.textWrapper, textWrapperClassName)}>
                    <span className={css.title}>{title}</span>
                    {subtitle && (
                        <span className={css.subtitle}>{subtitle}</span>
                    )}
                </div>
                <div className={css.separator} />
            </div>
        </Link>
    ) : (
        <span onClick={onClick} className={css.element}>
            <div className={css.wrapper}>
                <div className={css.topIcon}>{icon}</div>
                <div className={css.bottomText}>{title}</div>
            </div>
        </span>
    );
};
