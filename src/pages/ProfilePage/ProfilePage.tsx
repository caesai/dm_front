import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
// Atoms
import { backButtonAtom } from '@/atoms/backButtonAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { TicketsIcon } from '@/components/Icons/TicketsIcon.tsx';
import { BookIcon } from '@/components/Icons/BookIcon.tsx';
import { UserProfileIcon } from '@/components/Icons/UserProfileIcon.tsx';
import { PlainGiftIcon } from '@/components/Icons/PlaingGiftIcon.tsx';
import { KitchenIcon } from '@/components/Icons/KitchenIcon.tsx';
import { StarPrivelegyIcon } from '@/components/Icons/StarPrivelegy.tsx';
// Styles
import css from '@/pages/ProfilePage/ProfilePage.module.css';

export const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [backUrlAtom] = useAtom(backButtonAtom);

    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.pageWrapper}>
                    <div className={css.header}>
                        <RoundedButton
                            icon={<BackIcon size={24} color={'var(--dark-grey)'} />}
                            action={() => navigate(backUrlAtom)}
                        />
                        <span className={css.headerTitle}>Профиль</span>
                        <div className={css.spacer}></div>
                    </div>
                    <div className={css.navLinks}>
                        <Link to={'/myBookings'} className={css.navLink}>
                            <BookIcon size={24} color={'black'} />
                            <span className={css.navLinkTitle}>Мои бронирования</span>
                        </Link>
                        <Link to={'/tickets'} className={css.navLink}>
                            <TicketsIcon size={24} color={'black'} />
                            <span className={css.navLinkTitle}>Мои билеты</span>
                        </Link>
                        <Link to={'/gastronomy/my'} className={css.navLink}>
                            <KitchenIcon size={24} color={'black'} />
                            <span className={css.navLinkTitle}>Мои заказы</span>
                        </Link>
                        <Link to={'/privelegies'} className={css.navLink}>
                            <StarPrivelegyIcon size={24} color={'black'} />
                            <span className={css.navLinkTitle}>Привилегии</span>
                        </Link>
                        <Link to={'/certificates/my'} className={css.navLink}>
                            <PlainGiftIcon size={24} color={'black'} />
                            <span className={css.navLinkTitle}>Подарочные сертификаты</span>
                        </Link>
                        <Link to={'/me'} className={css.navLink}>
                            <UserProfileIcon size={24} color={'black'} />
                            <span className={css.navLinkTitle}>Личные данные</span>
                        </Link>
                    </div>
                </div>
            </div>
        </Page>
    );
};
