import css from './OptionsNavigation.module.css';
import { OptionsNavigationElement } from '@/components/OptionsNavigation/OptionsNavigationElement/OptionsNavigationElement.tsx';
// import { ChatIcon } from '@/components/Icons/ChatIcon.tsx';
import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
import {PrivelegiesPopup} from "@/components/PrivelegiesPopup/PrivelegiesPopup.tsx";
import {useState} from "react";
import { useAtom } from 'jotai/index';
import {userAtom} from "@/atoms/userAtom.ts";
import {StarPrivelegyIcon} from "@/components/Icons/StarPrivelegy.tsx";
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
            {tg_id && [5753349682, 217690245, 291146366, 940813721, 1225265717, 1145014952, 5362638149, 551243345, 701368624, 1090746420, 596483540, 1050003812, 542527667, 483425133, 451194888, 1020365281, 7077186349, 229667270, 257329939, 1094749437, 201790418, 79219030954, 706889029, 1357403642, 475197315, 586628247, 244816672, 353624620, 115555014, 153495524, 1283802964, 84327932, 163811519, 7160315434, 118832541, 189652327, 5165491111].includes(tg_id) && (
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
