import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai/index';
import classNames from 'classnames';
// APIs
import { BASE_BOT } from '@/api/base.ts';
// Atoms
import { userAtom } from '@/atoms/userAtom.ts';
import { headerScrolledAtom } from '@/atoms/restaurantPageAtom.ts';
// Components
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { Share } from '@/components/Icons/Share.tsx';
import { IconlyProfile } from '@/components/Icons/Profile.tsx';
import { RestaurantNavigation } from '@/components/RestaurantNavigation/RestaurantNavigation.tsx';
// Styles
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';
import { useNavigationHistory } from '@/hooks/useNavigationHistory';
import { useGetRestaurantById } from '@/atoms/restaurantsListAtom';

interface INavigationBlockProps {
    restaurantId: string;
}

/**
 * Компонент блока навигации на странице ресторана.
 *
 * Отображает навигацию по ресторану и управляет её состоянием.
 *
 * @component
 * @param {INavigationBlockProps} props - Пропсы компонента
 * @returns {JSX.Element} Компонент блока навигации на странице ресторана
 */
export const NavigationBlock: React.FC<INavigationBlockProps> = ({
    restaurantId,
}: INavigationBlockProps): JSX.Element => {
    const restaurant = useGetRestaurantById(restaurantId);
    const user = useAtomValue(userAtom);
    const navigate = useNavigate();
    const { goBack } = useNavigationHistory();
    /** Состояние скролла страницы и его установка */
    const [headerScrolled, setHeaderScrolled] = useAtom(headerScrolledAtom);

    const handleGoBack = () => {
        if (!user?.complete_onboarding) {
            navigate('/onboarding');
        } else {
            goBack();
        }
    };

    /**
     * Функция для перехода на страницу профиля.
     *
     * Переходит на страницу профиля.
     *
     * @returns {void}
     */
    const goToProfile = (): void => {
        navigate('/profile');
    };

    /**
     * Функция для отправки ресторана в друзья.
     *
     * Отправляет ресторан в друзья через Telegram.
     *
     * @returns {void}
     */
    const shareRestaurant = (): void => {
        const url = encodeURI(`https://t.me/${BASE_BOT}?startapp=restaurantId_${restaurantId}`);
        const sharedTitle = encodeURI(restaurant?.title || '');
        const shareData = {
            title: sharedTitle,
            url,
        };
        try {
            if (navigator && navigator.canShare(shareData)) {
                navigator
                    .share(shareData)
                    .then()
                    .catch((err) => {
                        console.error(JSON.stringify(err));
                    });
            }
        } catch (e) {
            window.open(`https://t.me/share/url?url=${url}&text=${sharedTitle}`, '_blank');
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setHeaderScrolled(window.scrollY > 190); // Если прокрутка больше 190px – меняем состояние
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            setHeaderScrolled(false); // Сброс при размонтировании
        };
    }, [setHeaderScrolled]);

    return (
        <header className={classNames(css.header, headerScrolled ? css.scrolled : null)}>
            <div className={css.headerNav}>
                <div className={css.headerTop}>
                    <div className={css.headerNavBlock}>
                        <RoundedButton
                            icon={<BackIcon color={'var(--dark-grey)'} />}
                            action={handleGoBack}
                        ></RoundedButton>
                    </div>
                    {headerScrolled ? <span className={css.headerTitle}>{restaurant?.title || ''}</span> : null}
                    <div className={css.headerNavBlock}>
                        <RoundedButton icon={<Share color={'var(--dark-grey)'} />} action={shareRestaurant} />
                        {user && user.complete_onboarding && (
                            <RoundedButton icon={<IconlyProfile color={'var(--dark-grey)'} />} action={goToProfile} />
                        )}
                    </div>
                </div>
                {headerScrolled ? <RestaurantNavigation restaurantId={restaurantId} /> : null}
            </div>
        </header>
    );
};
