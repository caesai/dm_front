import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { TicketsIcon } from '@/components/Icons/TicketsIcon.tsx';
import { BookIcon } from '@/components/Icons/BookIcon.tsx';
import { UserProfileIcon } from '@/components/Icons/UserProfileIcon.tsx';
import { backButtonAtom } from '@/atoms/backButtonAtom.ts';
import { PlainGiftIcon } from '@/components/Icons/PlaingGiftIcon.tsx';
import { KitchenIcon } from '@/components/Icons/KitchenIcon.tsx';
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
                        <span className={css.navLink} onClick={() => navigate('/tickets')}>
                            <TicketsIcon size={24} color={'black'} />
                            <span className={css.navLinkTitle}>Мои билеты</span>
                        </span>
                        <Link to={'/me'} className={css.navLink}>
                            <UserProfileIcon size={24} color={'black'} />
                            <span className={css.navLinkTitle}>Личные данные</span>
                        </Link>
                        <Link to={'/certificates/my'} className={css.navLink}>
                            <PlainGiftIcon size={24} color={'black'} />
                            <span className={css.navLinkTitle}>Подарочные сертификаты</span>
                        </Link>
                        <Link to={'/gastronomy/my'} className={css.navLink}>
                            <KitchenIcon size={24} color={'black'} />
                            <span className={css.navLinkTitle}>Мои заказы</span>
                        </Link>
                    </div>
                </div>
            </div>
        </Page>
    );
};
