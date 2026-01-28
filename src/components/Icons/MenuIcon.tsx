type IconlyIconProps = {
    size?: number;
    color?: string;
};

export const MenuIcon = ({ size = 24, }: IconlyIconProps) => {
    return (
        <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_8300_42897)">
                <path d="M4.66797 7H23.3346" stroke="black" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round" />
                <path d="M4.66797 14H23.3346" stroke="black" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round" />
                <path d="M4.66797 21H23.3346" stroke="black" strokeWidth="2" strokeLinecap="round"
                      strokeLinejoin="round" />
            </g>
            <defs>
                <clipPath id="clip0_8300_42897">
                    <rect width="28" height="28" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
};
