type IconProps = {
    size?: number;
    color?: string;
};

export const DoubleCheckIcon = ({ size = 24 }: IconProps) => {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.0001 5L5.83341 14.1667L1.66675 10" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.3333 8.3335L12.0833 14.5835L10.8333 13.3335" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>

    );
};
