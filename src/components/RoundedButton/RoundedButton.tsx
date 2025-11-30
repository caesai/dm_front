import css from './roundedButton.module.css';
import { CSSProperties, FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';

type Props = {
    icon: ReactNode;
    is_link?: boolean;
    to?: string;
    is_action?: boolean;
    action?: () => void;
    bgColor?: string;
    radius?: string;
    isBack?: boolean;
    style?: CSSProperties;
};

export const RoundedButton: FC<Props> = (props) => {
    const { goBack } = useNavigationHistory();

    const button = (
        <div
            onClick={() => (props.action ? props.action() : null)}
            className={css.rounded_button}
            style={{
                backgroundColor: `${props.bgColor} `,
                minWidth: `${props.radius ? `${props.radius}` : null}`,
                height: `${props.radius ? `${props.radius}` : null}`,
                ...props.style,
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
                    onClick={goBack}
                    className={css.rounded_button}
                    style={{
                        backgroundColor: `${props.bgColor}`,
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
