import { useEffect } from 'react';
import css from './Custom.module.css';
import classNames from 'classnames';
import { BASE_BOT } from '@/api/base.ts';
import { useNavigate } from 'react-router-dom';
import { Renderer, Tester } from '@/types/stories.types.ts';
// import classnames from 'classnames';


const renderer: Renderer = (
    {
        story,
        action,
        shouldWait,
        // config,
        // messageHandler,
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
    } = story.componentOptions;

    useEffect(() => {
        if (!shouldWait) {
            action('play');
        }
    }, [story, shouldWait])

    const openButtonUrl = () => {
        if (button_url) {
            if (button_url.includes(BASE_BOT)) {
                const url = button_url.split('?')[1];
                const slicedUrl = url.slice(url.lastIndexOf('=') + 1);
                if (slicedUrl.includes('restaurantId')) {
                    navigate('/restaurant/' + slicedUrl.slice(slicedUrl.lastIndexOf('_') + 1));
                }
                if (slicedUrl.includes('eventId')) {
                    navigate('/events/' + slicedUrl.slice(slicedUrl.lastIndexOf('_') + 1));
                }
                if (slicedUrl.includes('bookingId')) {
                    navigate('/booking/?id=' + slicedUrl.slice(slicedUrl.lastIndexOf('_') + 1));
                }
            }
            window.open(button_url);
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


export const tester: Tester = (story) => {
    return {
        condition: story.type === 'component',
        priority: 3,
    };
};

export default {
    renderer,
    tester,
};
