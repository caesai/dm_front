type IconProps = {
    size?: number;
    color?: string;
};

export const UsersIcon = ({ size = 24, color = '#000000' }: IconProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 16 16`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.89434 10.1382C9.35367 10.1382 11.4557 10.5109 11.4557 11.9995C11.4557 13.4882 9.36767 13.8715 6.89434 13.8715C4.43434 13.8715 2.33301 13.5022 2.33301 12.0129C2.33301 10.5235 4.42034 10.1382 6.89434 10.1382Z"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.89446 8.01317C5.27979 8.01317 3.97046 6.7045 3.97046 5.08984C3.97046 3.47517 5.27979 2.1665 6.89446 2.1665C8.50846 2.1665 9.81779 3.47517 9.81779 5.08984C9.82379 6.6985 8.52379 8.00717 6.91513 8.01317H6.89446Z"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M11.4888 7.25451C12.5561 7.10451 13.3781 6.18851 13.3801 5.07985C13.3801 3.98718 12.5834 3.08051 11.5388 2.90918"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12.897 9.82178C13.931 9.97578 14.653 10.3384 14.653 11.0851C14.653 11.5991 14.313 11.9324 13.7636 12.1411"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
