type IconlyIconProps = {
    size?: number;
    color?: string;
};

export const ChatIcon = ({ size = 24, color = '#000000' }: IconlyIconProps) => {
    return (
        <svg
            width={size}
            height={size}
            fill="none"
            viewBox="0 0 23 23"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M19.5714 19.5699C16.5152 22.6263 11.9898 23.2867 8.28642 21.574C7.73971 21.3539 7.29148 21.176 6.86537 21.176C5.67849 21.183 4.20117 22.3339 3.43336 21.567C2.66555 20.7991 3.81726 19.3206 3.81726 18.1266C3.81726 17.7004 3.64642 17.2602 3.42632 16.7124C1.71283 13.0096 2.37411 8.48269 5.43026 5.42721C9.3316 1.52443 15.67 1.52443 19.5714 5.4262C23.4797 9.33501 23.4727 15.6681 19.5714 19.5699Z"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M16.4393 12.9131H16.4483"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12.4304 12.9131H12.4394"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M8.4214 12.9131H8.4304"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
