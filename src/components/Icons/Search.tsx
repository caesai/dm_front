type IconlyIconProps = {
    size?: number;
    color?: string;
};

export const IconlySearch = ({
    size = 24,
    color = '#000000',
}: IconlyIconProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
        >
            <g
                stroke="none"
                strokeWidth="1.5"
                fill="none"
                fillRule="evenodd"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <g
                    id="Search"
                    transform="translate(2.000000, 2.000000)"
                    stroke={color}
                    strokeWidth="1.5"
                >
                    <circle
                        id="Ellipse_739"
                        cx="9.76659044"
                        cy="9.76659044"
                        r="8.9885584"
                    ></circle>
                    <line
                        x1="16.0183067"
                        y1="16.4851259"
                        x2="19.5423342"
                        y2="20.0000001"
                        id="Line_181"
                    ></line>
                </g>
            </g>
        </svg>
    );
};
