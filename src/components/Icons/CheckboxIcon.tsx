type IconProps = {
    size?: number;
    color?: string;
};

export const CheckboxIcon = ({ size }: IconProps) => {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};
