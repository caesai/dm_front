type IconProps = {
    size?: number;
    color?: string;
};

export const CloseIcon = ({ size = 24 }: IconProps) => {
    return (
        <svg
            width={size}
            height={size}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect y="0.5" width="44" height="44" rx="22" fill="#F4F4F4"/>
            <path d="M26.3918 18.0903L17.6064 26.8757" stroke="#545454" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M26.3952 26.8809L17.6025 18.0864" stroke="#545454" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
};
