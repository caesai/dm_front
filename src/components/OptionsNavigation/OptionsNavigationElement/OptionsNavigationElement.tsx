import css from './OptionsNavigationElement.module.css';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

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
}

export const OptionsNavigationElement = (
    props: OptionsNavigationElementProps
) => {
    return props.link ? (
        <Link to={props.link} className={classNames(css.element, props.className)} style={{ backgroundImage: `url(${props.img})` }} state={props.locationState}>
            <div className={css.wrapper}>
                <div className={classNames(css.textWrapper, props.textWrapperClassName)}>
                    <span className={css.title}>{props.title}</span>
                    {props.subtitle && (
                        <span className={css.subtitle}>{props.subtitle}</span>
                    )}
                </div>
                <div className={css.separator} />
            </div>
        </Link>
    ) : (
        <span onClick={props.onClick} className={css.element}>
            <div className={css.wrapper}>
                <div className={css.topIcon}>{props.icon}</div>
                <div className={css.bottomText}>{props.title}</div>
            </div>
        </span>
    );
};
