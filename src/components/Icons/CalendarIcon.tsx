type IconProps = {
    size?: number;
    color?: string;
};

export const CalendarIcon = ({ size = 24, color = '#000000' }: IconProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 17 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M2.56177 6.2698H14.4444"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M11.4612 8.87331H11.4674"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M8.50322 8.87331H8.5094"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5.53862 8.87331H5.5448"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M11.4612 11.4641H11.4674"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M8.50322 11.4641H8.5094"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5.53862 11.4641H5.5448"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M11.1958 1.3335V3.52735"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M5.81027 1.3335V3.52735"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.3255 2.38623H5.68064C3.72285 2.38623 2.5 3.47685 2.5 5.48158V11.5147C2.5 13.5509 3.72285 14.6668 5.68064 14.6668H11.3193C13.2833 14.6668 14.5 13.5698 14.5 11.5651V5.48158C14.5062 3.47685 13.2895 2.38623 11.3255 2.38623Z"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
