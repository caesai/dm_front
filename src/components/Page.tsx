import React, { useEffect } from 'react';
import { backButton } from '@telegram-apps/sdk-react';
// Hooks
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';

interface IPageProps {
    children: React.ReactNode;
    back?: boolean;
    className?: string;
    id?: string;
}
/**
 * Компонент страницы.
 *
 * @param {IPageProps} props - Пропсы компонента.
 * @returns {JSX.Element} Компонент страницы.
 */
export const Page: React.FC<IPageProps> = ({ children, back = true, className, id }: IPageProps): JSX.Element => {
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

    return (
        <section className={className} id={id}>
            {children}
        </section>
    );
};
