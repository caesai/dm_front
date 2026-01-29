import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAtomValue, useSetAtom } from 'jotai';
// Atoms
import { permissionsAtom, setTesterModeAtom, testerModeAtom } from '@/atoms/userAtom.ts';
// Components
import { Page } from '@/components/Page.tsx';
import { CheckBoxInput } from '@/components/CheckBoxInput/CheckBoxInput.tsx';
import { TicketsIcon } from '@/components/Icons/TicketsIcon.tsx';
import { BookIcon } from '@/components/Icons/BookIcon.tsx';
import { UserProfileIcon } from '@/components/Icons/UserProfileIcon.tsx';
import { PlainGiftIcon } from '@/components/Icons/PlaingGiftIcon.tsx';
import { KitchenIcon } from '@/components/Icons/KitchenIcon.tsx';
import { StarPrivilegeIcon } from '@/components/Icons/StarPrivilege.tsx';
import { PageHeader } from '@/components/PageHeader/PageHeader.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { BellIcon } from '@/components/Icons/BellIcon.tsx';
// Styles
import css from '@/pages/ProfilePage/ProfilePage.module.css';


/**
 * Страница профиля.
 *
 * @component
 * @returns {JSX.Element} Компонент страницы профиля.
 */
export const ProfilePage: React.FC = (): JSX.Element => {
    const permissions = useAtomValue(permissionsAtom);
    const testerMode = useAtomValue(testerModeAtom);
    const setTesterMode = useSetAtom(setTesterModeAtom);
    const navigate = useNavigate();
    const toggleTesterMode = () => {
        setTesterMode(!testerMode.enabled);
    };
    const goBack = () => {
        navigate('/');
    };
    return (
        <Page back={true} className={css.page}>
            <PageHeader title="Профиль" goBack={goBack} className={css.pageHeader} />
            <ContentContainer className={css.pageWrapper}>
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
                {permissions.includes('hospitality_heroes') && (
                    <Link to={'/privilege'} className={css.navLink}>
                        <StarPrivilegeIcon size={24} color={'black'} />
                        <span className={css.navLinkTitle}>Привилегии</span>
                    </Link>
                )}
                <Link to={'/certificates/my'} className={css.navLink}>
                    <PlainGiftIcon size={24} color={'black'} />
                    <span className={css.navLinkTitle}>Подарочные сертификаты</span>
                </Link>
                <Link to={'/me'} className={css.navLink}>
                    <UserProfileIcon size={24} color={'black'} />
                    <span className={css.navLinkTitle}>Личные данные</span>
                </Link>
                <Link to={'/notifications'} className={css.navLink}>
                    <BellIcon size={24} color={'black'} />
                    <span className={css.navLinkTitle}>Мои уведомления</span>
                </Link>
                {permissions.includes('tester') && (
                    <>
                        <div className={css.testerModeDivider} />
                        <CheckBoxInput
                            fontSize={16}
                            bold={true}
                            checked={testerMode.enabled}
                            noBackground={true}
                            toggle={toggleTesterMode}
                            label="Режим тестировщика"
                        />
                        {testerMode.enabled && (
                            <div className={css.testerModeDescription}>
                                <span>В режиме тестировщика доступны функции, которые не доступны для обычных пользователей.</span>
                            </div>
                        )}
                    </>
                )}
            </ContentContainer>
        </Page>
    );
};
