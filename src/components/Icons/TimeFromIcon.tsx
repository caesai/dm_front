type IconProps = {
    size?: number;
    color?: string;
};

export const TimeFromIcon = ({ size }: IconProps) => {
    return (
        <svg width={size} height={size}  fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6V12L13.56 12.78" stroke="black" strokeWidth="1.5" strokeLinecap="round"
                  strokeLinejoin="round" />
            <path
                d="M13.2273 21.9254C11.1982 22.1763 9.14093 21.7992 7.3327 20.845C5.52447 19.8907 4.0522 18.4051 3.11428 16.5883C2.17635 14.7716 1.81785 12.711 2.08709 10.6842C2.35632 8.65739 3.24034 6.76184 4.62004 5.25294C5.99973 3.74404 7.80879 2.69431 9.80344 2.24521C11.7981 1.7961 13.8825 1.9692 15.7757 2.74118C17.669 3.51315 19.2801 4.84691 20.392 6.56273C21.5039 8.27854 22.0631 10.2939 21.9943 12.3374"
                stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 18L18 14L22 18" stroke="black" strokeWidth="1.5" strokeLinecap="round"
                  strokeLinejoin="round" />
            <path d="M18 22V14" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};
