import css from './roundedButton.module.css';
import { FC, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type Props = {
    icon: ReactNode;
    is_link?: boolean;
    to?: string;
    is_action?: boolean;
    action?: () => void;
    bgColor?: string;
    radius?: string;
    isBack?: boolean;
};

export const RoundedButton: FC<Props> = (props) => {
    const navigate = useNavigate();

    const button = (
        <div
            onClick={() => (props.action ? props.action() : null)}
            className={css.rounded_button}
            style={{
                backgroundColor: `${props.bgColor} `,
                minWidth: `${props.radius ? `${props.radius}` : null}`,
                height: `${props.radius ? `${props.radius}` : null}`,
            }}
        >
            {props.icon}
        </div>
    );

    return (
        <>
            {props.is_link && props.to ? (
                <Link to={props.to}>{button}</Link>
            ) : props.isBack ? (
                <div
                    onClick={() => navigate(-1)}
                    className={css.rounded_button}
                    style={{
                        backgroundColor: `${props.bgColor} `,
                        minWidth: `${props.radius ? `${props.radius}` : null}`,
                        height: `${props.radius ? `${props.radius}` : null}`,
                    }}
                >
                    {props.icon}
                </div>
            ) : (
                button
            )}
        </>
    );
};
