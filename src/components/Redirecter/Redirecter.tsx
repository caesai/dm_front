import { useRedirectLogic } from '@/hooks/useRedirectLogic.ts';
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';

export const Redirecter = () => {
    useRedirectLogic();
    useNavigationHistory();
    return null;
};
