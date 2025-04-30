type IconProps = {
    size?: number;
    color?: string;
};

export const TimeCircleIcon = ({ size = 24, color = '#000000' }: IconProps) => {
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
                d="M10 20.5001C4.48 20.5001 0 16.0301 0 10.5001C0 4.98012 4.48 0.500122 10 0.500122C15.53 0.500122 20 4.98012 20 10.5001C20 16.0301 15.53 20.5001 10 20.5001ZM13.19 14.2101C13.31 14.2801 13.44 14.3201 13.58 14.3201C13.83 14.3201 14.08 14.1901 14.22 13.9501C14.43 13.6001 14.32 13.1401 13.96 12.9201L10.4 10.8001V6.18012C10.4 5.76012 10.06 5.43012 9.65 5.43012C9.24 5.43012 8.9 5.76012 8.9 6.18012V11.2301C8.9 11.4901 9.04 11.7301 9.27 11.8701L13.19 14.2101Z"
                fill={color}
            />
        </svg>
    );
};
