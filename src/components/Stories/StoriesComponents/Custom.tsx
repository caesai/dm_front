import React, { useEffect } from 'react';
import css from './Custom.module.css';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { IStory } from '@/types/stories.types.ts';
import { parseStartParam } from '@/utils/startParam.utils.ts';

interface CustomStoryComponentProps {
    story: IStory;
    action: Function;
    isPaused: boolean;
    shouldWait: boolean;
}

export const CustomStoryComponent: React.FC<CustomStoryComponentProps> = (
    {
        story,
        action,
        shouldWait,
        // config,
    }
    ,
) => {
    const navigate = useNavigate();

    const {
        title,
        description,
        url,
        button_url,
        button_text,
        button_color,
        component_type,
    } = story;
    useEffect(() => {
        if (!shouldWait) {
            action('play');
        }
    }, [story, shouldWait]);

    const openButtonUrl = () => {
        if (!button_url) return;

        try {
            // Парсим URL вида https://t.me/dmdev1bot?startapp=restaurantId_4
            const url = new URL(button_url);
            const startappParam = url.searchParams.get('startapp');

            if (!startappParam) {
                // Если нет параметра startapp, открываем URL в новой вкладке
                window.open(button_url, '_blank');
                return;
            }

            // Парсим параметр для извлечения сущностей и специальных ключевых слов
            // Логика точно соответствует useRedirectLogic.ts
            const parsedParam = parseStartParam(startappParam);

            // Приоритет: специальное ключевое слово > сущность > главная страница
            if (parsedParam.specialKeyword) {
                // Обрабатываем специальные ключевые слова (логика из handleSpecialKeywordNavigation)
                switch (parsedParam.specialKeyword) {
                    case 'hospitality_heroes':
                        navigate('/hospitality-heroes', { replace: true });
                        return;
                    case 'banquet':
                        navigate('/banquets/:restaurantId/address', { replace: true });
                        return;
                    case 'gastronomy':
                        navigate('/gastronomy/choose', { replace: true });
                        return;
                    case 'certificates':
                        navigate('/certificates/1', { replace: true });
                        return;
                    case 'booking':
                        navigate('/booking', { replace: true, state: { shared: true } });
                        return;
                }
            } else if (parsedParam.entityType && parsedParam.entityId) {
                // Обрабатываем сущности (логика из handleEntityNavigation)
                switch (parsedParam.entityType) {
                    case 'restaurant':
                        navigate(`/restaurant/${parsedParam.entityId}`, { replace: true, state: { shared: true } });
                        return;
                    case 'event':
                        navigate(`/events/${parsedParam.entityId}/details`, { replace: true, state: { shared: true } });
                        return;
                    case 'ticket':
                        navigate(`/tickets/${parsedParam.entityId}`, { replace: true, state: { shared: true } });
                        return;
                    case 'certificate':
                        navigate(`/certificates/landing/${parsedParam.entityId}`, { replace: true, state: { shared: true } });
                        return;
                    case 'event_city':
                        navigate('/events', { replace: true, state: { shared: true, cityId: parsedParam.entityId } });
                        return;
                    case 'event_restaurant':
                        navigate('/events', { replace: true, state: { shared: true, restaurantId: parsedParam.entityId } });
                        return;
                }
            } else {
                // Если не найдено ни ключевое слово, ни сущность — переход на главную
                navigate('/', { replace: true });
                return;
            }
        } catch (error) {
            // Если не удалось распарсить URL (не валидный URL), открываем его в новой вкладке
            console.error('Error parsing button_url:', error);
            window.open(button_url, '_blank');
        }
    };

    return (
        <div className={classNames(css.storyComponent)} style={{
            backgroundImage: component_type && component_type == 2 ? `url(${url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
        }}>
            <div className={css.storyWrapper}>
                <div className={css.storyFooter}>
                    <div className={css.storyDescription}>
                        <h2 className={classNames(css.storyDescriptionTitle)}>
                            {title}
                        </h2>
                        <span className={classNames(css.storyDescriptionSubtitle)}>
                            {description}
                        </span>
                    </div>
                    {button_url && (
                        <div className={css.button_container}>
                            <div
                                className={css.button}
                                style={{
                                    backgroundColor: button_color?.toString(),
                                }}
                                onClick={openButtonUrl}
                            >
                                <span>{button_text}</span>
                            </div>
                        </div>
                    )}
                </div>
                {url && component_type && component_type == 1 && (
                    <div className={css.storyImageWrapper}>
                        <img src={url} alt={description?.toString()} />
                    </div>
                )}
            </div>
        </div>
    );
};

