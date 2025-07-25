type IconProps = {
    size?: number;
    color?: string;
};

export const StarPrivelegyIcon = ({ size = 24 }: IconProps) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 23 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M11.0371 4.87207C11.2618 4.18157 12.2382 4.18157 12.4629 4.87207L13.2256 7.21875C13.5268 8.14569 14.3906 8.77328 15.3652 8.77344H17.833C18.5594 8.77356 18.8611 9.70285 18.2734 10.1299L16.2773 11.5801C15.4889 12.1529 15.159 13.1688 15.46 14.0957L16.2227 16.4424C16.4472 17.1334 15.6561 17.7083 15.0684 17.2812L13.0723 15.8311C12.2837 15.2582 11.2163 15.2582 10.4277 15.8311L8.43164 17.2812C7.84385 17.7083 7.05283 17.1334 7.27734 16.4424L8.04004 14.0957C8.34099 13.1688 8.01112 12.1529 7.22266 11.5801L5.22656 10.1299C4.63887 9.70285 4.94057 8.77356 5.66699 8.77344H8.13477C9.10938 8.77328 9.97323 8.14569 10.2744 7.21875L11.0371 4.87207Z"
                stroke="#B9B9B9" strokeWidth="1.5"/>
            <path d="M6.33057 3.9502L7.22758 5.14621" stroke="#B9B9B9" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M2.98975 14.2632L4.43848 13.8941" stroke="#B9B9B9" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M20.6362 14.2632L19.1875 13.8941" stroke="#B9B9B9" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M11.7876 19.5171L11.7876 20.5636" stroke="#B9B9B9" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M17.2441 3.9502L16.3471 5.14621" stroke="#B9B9B9" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    );
}
