import { useLocation, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { navigationHistoryAtom } from '@/atoms/navigationHistoryAtom.ts';

/**
 * Пользовательский хук React для управления и навигации по истории браузера в приложении,
 * использующий `react-router-dom` и `jotai`.
 *
 * Он автоматически отслеживает историю навигации, ограничивает ее последними 5 уникальными записями
 * и предоставляет служебные функции для доступа к предыдущим путям и выполнения безопасных операций "назад".
 *
 * @returns {{ goBack: () => void, getPreviousPath: () => string | null, history: string[] }} Объект, содержащий
 * `goBack` (функцию для безопасной навигации назад), `getPreviousPath` (функцию для получения
 * непосредственно предыдущего пути) и `history` (массив последних путей навигации).
 */
export const useNavigationHistory = (): {
    goBack: () => void;
    getPreviousPath: () => string | null;
    history: string[];
} => {
    const location = useLocation();
    const navigate = useNavigate();
    const [navigationHistory, setNavigationHistory] = useAtom(navigationHistoryAtom);

    /**
     * Обновляет атом истории навигации новым путем.
     * Гарантирует отсутствие немедленных дубликатов и ограничивает историю 5 записями.
     * @param {string} path Новый путь для добавления в историю.
     */
    const updateHistory = (path: string) => {
        setNavigationHistory(prev => {
            // Предотвращаем добавление одного и того же пути последовательно
            if (prev[prev.length - 1] === path) return prev;

            const newHistory = [...prev, path];
            // Ограничиваем историю последними 5 записями
            return newHistory.length > 5 ? newHistory.slice(-5) : newHistory;
        });
    };

    // Хук эффекта для обновления истории при каждом изменении pathname локации
    useEffect(() => {
        updateHistory(location.pathname);
    }, [location.pathname]);

    /**
     * Извлекает путь страницы, посещенной непосредственно перед текущей.
     * @returns {string | null} Предыдущий URL-путь или `null`, если история содержит менее 2 записей.
     */
    const getPreviousPath = () => {
        if (navigationHistory.length < 2) return null;
        return navigationHistory[navigationHistory.length - 2];
    };

    /**
     * Вспомогательная функция для очистки массива истории путем удаления последовательных повторяющихся записей.
     * @param {string[]} history Исходный массив истории навигации.
     * @returns {string[]} Новый массив без смежных дубликатов.
     */
    const removeDuplicates = (history: string[]): string[] => {
        if (history.length === 0) return [];

        const result = [history[0]]; // Используем history[0], как в оригинальном коде

        for (let i = 1; i < history.length; i++) {
            if (history[i] !== history[i - 1]) {
                result.push(history[i]);
            }
        }

        return result;
    };

    /**
     * Осуществляет навигацию на один шаг назад в истории.
     *
     * Обрабатывает очистку истории для поиска осмысленной предыдущей страницы
     * и перенаправляет на домашнюю страницу ('/'), если история слишком короткая
     * или если предыдущая страница является ограниченным путем (например, страницы входа в систему или аутентификации).
     */
    const goBack = () => {
        // Создаем копию для очистки от последовательных дубликатов для логичной навигации 'назад'
        const cleanedHistory = removeDuplicates([...navigationHistory]);

        if (cleanedHistory.length < 2) {
            // Если мы не можем осмысленно вернуться назад, переходим домой
            navigate('/');
            return;
        }

        const previousPath = cleanedHistory[cleanedHistory.length - 2];
        // Список путей, при обнаружении которых мы не возвращаемся назад, а идем на главную
        const restrictedPaths = ['/auth', '/login', '/phoneConfirmation'];

        // Если предыдущая страница была ограниченной страницей, переходим домой вместо возврата
        if (previousPath && restrictedPaths.some(path => previousPath.includes(path))) {
            navigate('/');
        } else {
            // Используем нативный `navigate(-1)` для стандартной функции "назад"
            navigate(-1);
        }
    };

    return {
        goBack,
        getPreviousPath,
        history: navigationHistory,
    };
};
