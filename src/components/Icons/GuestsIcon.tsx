type IconProps = {
    size?: number;
    color?: string;
};

export const GuestsIcon = ({ size = 16, color = "#000000" }: IconProps) => {
    return (
        <svg width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd"
                  d="M6.39336 10.1377C8.8527 10.1377 10.9547 10.5104 10.9547 11.999C10.9547 13.4877 8.8667 13.871 6.39336 13.871C3.93336 13.871 1.83203 13.5017 1.83203 12.0124C1.83203 10.523 3.91936 10.1377 6.39336 10.1377Z"
                  stroke={color} strokeLinecap="round" strokeLinejoin="round" />
            <path fillRule="evenodd" clipRule="evenodd"
                  d="M6.39666 8.01366C4.78199 8.01366 3.47266 6.70499 3.47266 5.09033C3.47266 3.47566 4.78199 2.16699 6.39666 2.16699C8.01066 2.16699 9.31999 3.47566 9.31999 5.09033C9.32599 6.69899 8.02599 8.00766 6.41732 8.01366H6.39666Z"
                  stroke={color} strokeLinecap="round" strokeLinejoin="round" />
            <path
                d="M10.9883 7.25451C12.0556 7.10451 12.8776 6.18851 12.8796 5.07985C12.8796 3.98718 12.0829 3.08051 11.0383 2.90918"
                stroke={color} strokeLinecap="round" strokeLinejoin="round" />
            <path
                d="M12.3984 9.82129C13.4324 9.97529 14.1544 10.338 14.1544 11.0846C14.1544 11.5986 13.8144 11.932 13.2651 12.1406"
                stroke={color} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

