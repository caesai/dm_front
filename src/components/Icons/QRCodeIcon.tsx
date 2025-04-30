type IconProps = {
    size?: number;
    color?: string;
};

export const QRCodeIcon = ({ size = 24, color = '#000000' }: IconProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M2.8 2C2.58783 2 2.38434 2.08429 2.23431 2.23431C2.08429 2.38434 2 2.58783 2 2.8V6H6V2H2.8ZM5 5H3V3H5V5Z"
                fill={color}
            />
            <path
                d="M2 15.2C2 15.4122 2.08429 15.6157 2.23431 15.7657C2.38434 15.9157 2.58783 16 2.8 16H6V12H2V15.2ZM3 13H5V15H3V13Z"
                fill={color}
            />
            <path
                d="M12 16H15.2C15.4122 16 15.6157 15.9157 15.7657 15.7657C15.9157 15.6157 16 15.4122 16 15.2V12H12V16ZM13 13H15V15H13V13Z"
                fill={color}
            />
            <path
                d="M15.2 2H12V6H16V2.8C16 2.58783 15.9157 2.38434 15.7657 2.23431C15.6157 2.08429 15.4122 2 15.2 2ZM15 5H13V3H15V5Z"
                fill={color}
            />
            <path d="M10 5V4H8V6H9V5H10Z" fill={color} />
            <path d="M6 6H7V7H6V6Z" fill={color} />
            <path d="M7 7H9V8H7V7Z" fill={color} />
            <path d="M10 3V4H11V2H7V4H8V3H10Z" fill={color} />
            <path d="M2 7H3V9H2V7Z" fill={color} />
            <path
                d="M6 8V9H5V7H4V9H3V10H2V11H4V10H5V11H6V10H7V8H6Z"
                fill={color}
            />
            <path d="M10 8H11V9H12V8H13V7H11V5H10V6H9V7H10V8Z" fill={color} />
            <path d="M9 15H7V16H11V15H10V14H9V15Z" fill={color} />
            <path d="M11 10V9H10V8H9V9H8V10H9V11H10V10H11Z" fill={color} />
            <path d="M15 10H16V11H15V10Z" fill={color} />
            <path d="M11 10H14V11H11V10Z" fill={color} />
            <path d="M15 7H14V8H13V9H14V10H15V9H16V8H15V7Z" fill={color} />
            <path d="M10 11H11V14H10V11Z" fill={color} />
            <path d="M7 14H8V13H9V12H8V10H7V14Z" fill={color} />
        </svg>
    );
};
