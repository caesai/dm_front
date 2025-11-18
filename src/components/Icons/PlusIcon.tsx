type IconProps = {
    size?: number;
    color?: string;
};

export const PlusIcon = ({ size = 14, color = '#000000' }: IconProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M7 2V12M2 7H12"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

