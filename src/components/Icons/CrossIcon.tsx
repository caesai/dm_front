type IconProps = {
    size?: number;
    color?: string;
};

export const CrossIcon = ({ size = 24, color = '#000000' }: IconProps) => {
    return (
        <svg
            width={size}
            height={size}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M26.3918 17.5906L17.6064 26.376"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M26.3945 26.3813L17.6018 17.5868"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
