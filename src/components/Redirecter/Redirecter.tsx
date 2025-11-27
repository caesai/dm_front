import { useRedirectLogic } from '@/hooks/useRedirectLogic.ts';
import { useNavigationHistory } from '@/hooks/useNavigationHistory.tsx';

export const Redirecter = () => {
    useRedirectLogic();
    useNavigationHistory();
    return null;
};
