type IconProps = {
    size?: number;
    color?: string;
};

export const DownArrow = ({ size = 24, color = '#000000' }: IconProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 16 9`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M15 1L8 8L1 1"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
