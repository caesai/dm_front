import { useRedirectLogic } from '@/hooks/useRedirectLogic.ts';
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
import { AppLoadingScreen } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';

interface RedirecterProps {
    children: React.ReactNode;
}

export const Redirecter: React.FC<RedirecterProps> = ({ children }) => {
    const { isInitialRedirectComplete } = useRedirectLogic();
    useNavigationHistory();
    
    // Показываем загрузку пока определяется начальный маршрут
    if (!isInitialRedirectComplete) {
        return <AppLoadingScreen />;
    }
    
    return <>{children}</>;
};
