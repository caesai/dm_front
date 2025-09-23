import css from './OptionsNavigation.module.css';
import { OptionsNavigationElement } from '@/components/OptionsNavigation/OptionsNavigationElement/OptionsNavigationElement.tsx';
// import { ChatIcon } from '@/components/Icons/ChatIcon.tsx';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import {PrivelegiesPopup} from "@/components/PrivelegiesPopup/PrivelegiesPopup.tsx";
import {useState} from "react";
import { useAtom } from 'jotai/index';
import {userAtom} from "@/atoms/userAtom.ts";
import {StarPrivelegyIcon} from "@/components/Icons/StarPrivelegy.tsx";
import { mockEventsUsersList } from '@/__mocks__/events.mock.ts';
// import {DEV_MODE} from "@/api/base.ts";
// import { reviewAtom } from '@/atoms/userAtom.ts';
// import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';

export const OptionsNavigation = () => {
    // const [review] = useAtom(reviewAtom);
    const [isOpen, setIsOpen] = useState(false);
    const [user] = useAtom(userAtom);
    const tg_id = window.Telegram.WebApp.initDataUnsafe.user.id;
    // console.log('tg_id: ', tg_id);
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
            <PrivelegiesPopup isOpen={isOpen} setOpen={setIsOpen} />
            {tg_id && mockEventsUsersList.includes(tg_id) && (
                <OptionsNavigationElement
                    icon={<CalendarIcon size={20} color={'var(--light-grey)'}/>}
                    title={'Мероприятия'}
                    link={'/events'}
                />
            )}
            {user?.username && ['w0esofwit','egormk','burovburov', 'iliathoughts'].includes(user?.username) && (
                <OptionsNavigationElement
                    icon={<StarPrivelegyIcon size={23} color={'var(--light-grey)'}  />}
                    title={'Привилегии'}
                    onClick={() => setIsOpen(!isOpen)}
                    // link={'/events'}
                />
            )}

            {/*{review.loading ? (*/}
            {/*    <PlaceholderBlock*/}
            {/*        width={'100%'}*/}
            {/*        height={'44px'}*/}
            {/*        rounded={'16px'}*/}
            {/*    />*/}
            {/*) : review.available ? (*/}
            {/*    <OptionsNavigationElement*/}
            {/*        icon={<ChatIcon size={20} color={'var(--light-grey)'} />}*/}
            {/*        title={'Оставить отзыв'}*/}
            {/*        link={'/profile?feedback=1'}*/}
            {/*    />*/}
            {/*) : (*/}
                <div style={{ width: '100%' }} />
            {/*)}*/}
        </div>
    );
};
