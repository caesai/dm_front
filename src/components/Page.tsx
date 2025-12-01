import { backButton } from '@telegram-apps/sdk-react';
import { PropsWithChildren, useEffect } from 'react';
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';

export function Page({
    children,
    back = true,
}: PropsWithChildren<{
    /**
     * True if it is allowed to go back from this page.
     */
    back?: boolean;
}>) {
    const { goBack } = useNavigationHistory();

    useEffect(() => {
        if (back) {
            backButton.show();
            return backButton.onClick(() => {
                goBack();
            });
        }
        backButton.hide();
    }, [back]);

    return <>{children}</>;
}
