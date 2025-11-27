import { useLocation, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { navigationHistoryAtom } from '@/atoms/navigationHistoryAtom.ts';

export const useNavigationHistory = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [navigationHistory, setNavigationHistory] = useAtom(navigationHistoryAtom);

    const updateHistory = (path: string) => {
        setNavigationHistory(prev => {
            if (prev[prev.length - 1] === path) return prev;

            const newHistory = [...prev, path];
            return newHistory.length > 5 ? newHistory.slice(-5) : newHistory;
        });
    };

    useEffect(() => {
        updateHistory(location.pathname);
    }, [location.pathname]);

    const getPreviousPath = () => {
        if (navigationHistory.length < 2) return null;
        return navigationHistory[navigationHistory.length - 2];
    };

    const removeDuplicates = (history: string[]): string[] => {
        if (history.length === 0) return [];

        const result = [history[0]];

        for (let i = 1; i < history.length; i++) {
            if (history[i] !== history[i - 1]) {
                result.push(history[i]);
            }
        }

        return result;
    };

    const goBack = () => {
        const cleanedHistory = removeDuplicates([...navigationHistory]);

        if (cleanedHistory.length < 2) {
            navigate('/');
            return;
        }

        const previousPath = cleanedHistory[cleanedHistory.length - 2];
        const restrictedPaths = ['/auth', '/login', '/phoneConfirmation'];

        if (previousPath && restrictedPaths.some(path => previousPath.includes(path))) {
            navigate('/');
        } else {
            navigate(-1);
        }
    };

    return {
        goBack,
        getPreviousPath,
        history: navigationHistory
    };
};