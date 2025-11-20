import { Page } from '@/components/Page.tsx';
import css from './ProfilePage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import {
    Link, useNavigate,
    // useSearchParams
} from 'react-router-dom';
import { TicketsIcon } from '@/components/Icons/TicketsIcon.tsx';
import { BookIcon } from '@/components/Icons/BookIcon.tsx';
// import {PenIcon} from '@/components/Icons/PenIcon.tsx';
import { UserProfileIcon } from '@/components/Icons/UserProfileIcon.tsx';
// import { SupportIcon } from '@/components/Icons/SupportIcon.tsx';
// import { QRCodeIcon } from '@/components/Icons/QRCodeIcon.tsx';
// import {FeedbackPopup} from '@/pages/ProfilePage/FeedbackPopup/FeedbackPopup.tsx';
// import {useState} from 'react';
import { useAtom } from 'jotai';
import { backButtonAtom } from '@/atoms/backButtonAtom.ts';
import {
    // reviewAtom,
    userAtom,
} from '@/atoms/userAtom.ts';
// import { DEV_MODE } from '@/api/base.ts';
import { PlainGiftIcon } from '@/components/Icons/PlaingGiftIcon.tsx';
import { mockEventsUsersList } from '@/__mocks__/events.mock.ts';
// import {DEV_MODE} from "@/api/base.ts";

export const ProfilePage = () => {
    // const [params] = useSearchParams();
    // const [feedbackPopup, setFeedbackPopup] = useState(
    //     !!params.get('feedback')
    // );
    const navigate = useNavigate();
    // const [review] = useAtom(reviewAtom);
    const [user] = useAtom(userAtom);
    const [backUrlAtom] = useAtom(backButtonAtom);
    const tg_id = window.Telegram.WebApp.initDataUnsafe.user.id;

    return (
        <Page back={true}>
            {/*<FeedbackPopup*/}
            {/*    isOpen={feedbackPopup}*/}
            {/*    setOpen={setFeedbackPopup}*/}
            {/*    booking_id={1}*/}
            {/*/>*/}

            <div className={css.page}>
                <div className={css.pageWrapper}>
                    <div className={css.header}>
                        <RoundedButton
                            icon={
                                <BackIcon
                                    size={24}
                                    color={'var(--dark-grey)'}
                                />
                            }
                            action={() => navigate(backUrlAtom)}
                        />
                        <span className={css.headerTitle}>Профиль</span>
                        <div className={css.spacer}></div>
                    </div>
                    <div className={css.navLinks}>
                        <Link to={'/myBookings'} className={css.navLink}>
                            <BookIcon size={24} color={'black'} />
                            <span className={css.navLinkTitle}>
                                Мои бронирования
                            </span>
                        </Link>
                        {tg_id && [5753349682, 217690245, 291146366, 940813721, 1225265717, 1145014952, 5362638149, 551243345, 701368624, 1090746420, 596483540, 1050003812, 542527667, 483425133, 451194888, 1020365281, 7077186349, 229667270, 257329939, 1094749437, 201790418, 79219030954, 706889029, 1357403642, 475197315, 586628247, 244816672, 353624620, 115555014, 153495524, 1283802964, 84327932, 163811519, 7160315434, 118832541, 189652327].includes(tg_id) && (
                            <span
                                className={css.navLink}
                                onClick={() => navigate('/tickets')}
                            >
                                    <TicketsIcon size={24} color={'black'} />
                                    <span className={css.navLinkTitle}>Мои билеты</span>
                                </span>
                        )}
                        {/*{review.available ? (*/}
                        {/*    <span*/}
                        {/*        className={css.navLink}*/}
                        {/*        // onClick={() => setFeedbackPopup(true)}*/}
                        {/*    >*/}
                        {/*        <PenIcon size={24} color={'black'}/>*/}
                        {/*        <span className={css.navLinkTitle}>*/}
                        {/*            Оставить отзыв*/}
                        {/*        </span>*/}
                        {/*    </span>*/}
                        {/*) : null}*/}
                        <Link to={'/me'} className={css.navLink}>
                            <UserProfileIcon size={24} color={'black'} />
                            <span className={css.navLinkTitle}>
                                Личные данные
                            </span>
                        </Link>
                        {tg_id && mockEventsUsersList.includes(tg_id) && (
                            <Link to={'/certificates/my'} className={css.navLink}>
                                <PlainGiftIcon size={24} color={'black'} />
                                <span className={css.navLinkTitle}>
                                    Подарочные сертификаты
                                </span>
                            </Link>
                        )}
                        {user?.administrator?.is_active ? (
                            <Link to={'/scanner'} className={css.navLink}>
                                <UserProfileIcon size={24} color={'black'} />
                                <span className={css.navLinkTitle}>
                                    Сканер билетов
                                </span>
                            </Link>
                        ) : null}
                        {/*<Link to={'/support'} className={css.navLink}>*/}
                        {/*    <SupportIcon size={24} color={'black'} />*/}
                        {/*    <span className={css.navLinkTitle}>Поддержка</span>*/}
                        {/*</Link>*/}
                    </div>
                </div>
            </div>
        </Page>
    );
};
