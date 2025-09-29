
type IconProps = {
    size?: number;
    color?: string;
};

export const TimeToIcon = ({ size }: IconProps) => {
    return (
        <svg width={size} height={size} viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 6V12L14.5 13" stroke="black" strokeWidth="1.5" strokeLinecap="round"
                  strokeLinejoin="round" />
            <path
                d="M12.8364 21.9943C10.793 22.0631 8.77756 21.5039 7.06175 20.392C5.34594 19.2801 4.01218 17.669 3.2402 15.7757C2.46822 13.8825 2.29512 11.7981 2.74423 9.80344C3.19334 7.80879 4.24307 5.99973 5.75196 4.62004C7.26086 3.24034 9.15642 2.35632 11.1832 2.08709C13.21 1.81785 15.2706 2.17635 17.0874 3.11428C18.9041 4.0522 20.3897 5.52447 21.344 7.3327C22.2983 9.14093 22.6753 11.1982 22.4244 13.2273"
                stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.5 18L18.5 22L22.5 18" stroke="black" strokeWidth="1.5" strokeLinecap="round"
                  strokeLinejoin="round" />
            <path d="M18.5 14V22" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

    );
};
