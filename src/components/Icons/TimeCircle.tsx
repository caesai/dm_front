type IconProps = {
    size?: number;
    color?: string;
};

export const TimeCircle = ({ size = 24, color = '#000000' }: IconProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.6666 8.00016C14.6666 11.4062 11.9059 14.1668 8.49992 14.1668C5.09392 14.1668 2.33325 11.4062 2.33325 8.00016C2.33325 4.59416 5.09392 1.8335 8.49992 1.8335C11.9059 1.8335 14.6666 4.59416 14.6666 8.00016Z"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M10.7875 9.96162L8.27417 8.46229V5.23096"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
