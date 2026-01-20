import {CSSProperties, FC} from 'react';
import css from './UniversalButton.module.css';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

interface UniversalButtonProps {
    width: number | 'full';
    title: string;
    color?: string;
    link?: string;
    target?: string;
    style?: CSSProperties;
    action?: () => void;
    theme?: 'red' | 'secondary';
}

export const UniversalButton: FC<UniversalButtonProps> = (p) => {
    return (
        <>
            {p.link ? (
                <Link
                    target={p.target}
                    to={p.link}
                    className={classNames(
                        p.theme ? css[p.theme] : null,
                        p.width == 'full' ? css.fullWidth : null
                    )}
                >
                    <span className={css.text} style={p.style}>{p.title}</span>
                </Link>
            ) : (
                <div
                    role={'button'}
                    className={classNames(
                        css.universalButton,
                        p.theme ? css[p.theme] : null,
                        p.width == 'full' ? css.fullWidth : null
                    )}
                    onClick={() => (p.action !== undefined ? p.action() : null)}
                >
                    <span className={css.text} style={{ ...p.style }}>{p.title}</span>
                </div>
            )}
        </>
    );
};
