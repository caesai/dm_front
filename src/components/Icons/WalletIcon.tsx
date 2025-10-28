type IconProps = {
    size?: number;
    color?: string;
};

export const WalletIcon = (
    {
        size = 24,
        color = '#000000',
    }: IconProps,
) => {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.5 7.99979L15.08 2.93979C15.1999 2.88239 15.3301 2.84948 15.4629 2.84299C15.5957 2.8365 15.7285 2.85656 15.8535 2.902C15.9784 2.94744 16.0931 3.01735 16.1907 3.10763C16.2883 3.19791 16.367 3.30675 16.422 3.42779L18.5 7.99979" stroke={color} strokeWidth="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 10V8" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 14V15" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 19V21" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20 8H4C2.89543 8 2 8.89543 2 10V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V10C22 8.89543 21.1046 8 20 8Z" stroke="black" strokeWidth="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>

    );
};
