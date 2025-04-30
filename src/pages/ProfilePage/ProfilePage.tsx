import { Page } from '@/components/Page.tsx';
import css from './ProfilePage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { TicketsIcon } from '@/components/Icons/TicketsIcon.tsx';
import { BookIcon } from '@/components/Icons/BookIcon.tsx';
import { PenIcon } from '@/components/Icons/PenIcon.tsx';
import { UserProfileIcon } from '@/components/Icons/UserProfileIcon.tsx';
// import { SupportIcon } from '@/components/Icons/SupportIcon.tsx';
// import { QRCodeIcon } from '@/components/Icons/QRCodeIcon.tsx';
import { FeedbackPopup } from '@/pages/ProfilePage/FeedbackPopup/FeedbackPopup.tsx';
import { useState } from 'react';
import { useAtom } from 'jotai';
import { backButtonAtom } from '@/atoms/backButtonAtom.ts';
import { reviewAtom, userAtom } from '@/atoms/userAtom.ts';

export const ProfilePage = () => {
    const [params] = useSearchParams();
    const [feedbackPopup, setFeedbackPopup] = useState(
        !!params.get('feedback')
    );
    const navigate = useNavigate();
    const [review] = useAtom(reviewAtom);
    const [user] = useAtom(userAtom);
    const [backUrlAtom] = useAtom(backButtonAtom);
    return (
        <Page back={true}>
            <FeedbackPopup
                isOpen={feedbackPopup}
                setOpen={setFeedbackPopup}
                booking_id={1}
            />

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
                        <span
                            className={css.navLink}
                            onClick={() => navigate('/tickets')}
                        >
                            <TicketsIcon size={24} color={'black'} />
                            <span className={css.navLinkTitle}>Мои билеты</span>
                        </span>
                        {review.available ? (
                            <span
                                className={css.navLink}
                                onClick={() => setFeedbackPopup(true)}
                            >
                                <PenIcon size={24} color={'black'} />
                                <span className={css.navLinkTitle}>
                                    Оставить отзыв
                                </span>
                            </span>
                        ) : null}
                        <Link to={'/me'} className={css.navLink}>
                            <UserProfileIcon size={24} color={'black'} />
                            <span className={css.navLinkTitle}>
                                Личные данные
                            </span>
                        </Link>
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
