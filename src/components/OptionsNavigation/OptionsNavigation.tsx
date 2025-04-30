import css from './OptionsNavigation.module.css';
import { OptionsNavigationElement } from '@/components/OptionsNavigation/OptionsNavigationElement/OptionsNavigationElement.tsx';
import { ChatIcon } from '@/components/Icons/ChatIcon.tsx';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import { useAtom } from 'jotai/index';
import { reviewAtom } from '@/atoms/userAtom.ts';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';

export const OptionsNavigation = () => {
    const [review] = useAtom(reviewAtom);

    // useEffect(() => {
    //     if (!auth?.access_token) {
    //         return;
    //     }
    //     APIIsReviewAvailable(auth.access_token)
    //         .then((res) => setIsReviewAvailable(res.data.available))
    //         .finally(() => setIsReviewLoading(false));
    // }, []);

    return (
        <div className={css.optionsNavigation}>
            <OptionsNavigationElement
                icon={<CalendarIcon size={20} color={'var(--light-grey)'} />}
                title={'Мероприятия'}
                link={'/events'}
            />
            {review.loading ? (
                <PlaceholderBlock
                    width={'100%'}
                    height={'44px'}
                    rounded={'16px'}
                />
            ) : review.available ? (
                <OptionsNavigationElement
                    icon={<ChatIcon size={20} color={'var(--light-grey)'} />}
                    title={'Оставить отзыв'}
                    link={'/profile?feedback=1'}
                />
            ) : (
                <div style={{ width: '100%' }} />
            )}
        </div>
    );
};
