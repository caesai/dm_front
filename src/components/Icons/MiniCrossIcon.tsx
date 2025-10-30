type IconProps = {
    size?: number;
    color?: string;
};

export const MiniCrossIcon = ({ size = 8, color = '#000000' }: IconProps) => {
    return (
        <svg width={size} height={size} viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.75 0.75L0.75 6.75" stroke={color} strokeWidth="1.5" strokeLinecap="round"
                  strokeLinejoin="round" />
            <path d="M6.75 6.75L0.75 0.75" stroke={color} strokeWidth="1.5" strokeLinecap="round"
                  strokeLinejoin="round" />
        </svg>

    );
};
