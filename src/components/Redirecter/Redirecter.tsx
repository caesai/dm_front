import { useRedirectLogic } from '@/hooks/useRedirectLogic.ts';
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
import { useDishesListCleanup } from '@/hooks/useDishesListCleanup.ts';

export const Redirecter = () => {
    useRedirectLogic();
    useNavigationHistory();
    useDishesListCleanup();
    return null;
};
