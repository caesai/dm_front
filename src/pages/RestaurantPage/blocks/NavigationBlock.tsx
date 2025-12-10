import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai/index';
import classNames from 'classnames';
// APIs
import { BASE_BOT } from '@/api/base.ts';
// Atoms
import { backButtonAtom } from '@/atoms/backButtonAtom.ts';
import { userAtom } from '@/atoms/userAtom.ts';
// Components
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { Share } from '@/components/Icons/Share.tsx';
import { IconlyProfile } from '@/components/Icons/Profile.tsx';
import { RestaurantNavigation } from '@/components/RestaurantNavigation/RestaurantNavigation.tsx';
// Styles
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';

interface INavigationBlockProps {
    restaurant_id: number;
    title?: string;
    isLoading: boolean;
    isEvents: boolean;
    isBanquets: boolean;
    isGastronomy: boolean;
}

export const NavigationBlock: React.FC<INavigationBlockProps> = ({
    restaurant_id,
    isBanquets,
    isLoading,
    isEvents,
    isGastronomy,
    title,
}) => {
    const [headerScrolled, setHeaderScrolled] = useState(false);

    const [, setBackUrlAtom] = useAtom(backButtonAtom);
    const [user] = useAtom(userAtom);
    const navigate = useNavigate();

    const goBack = () => {
        if (!user?.complete_onboarding) {
            navigate('/onboarding');
        } else {
            navigate('/');
        }
    };

    const goToProfile = () => {
        setBackUrlAtom(`/restaurant/${restaurant_id}`);
        navigate('/profile');
    };

    const shareRestaurant = () => {
        const url = encodeURI(`https://t.me/${BASE_BOT}?startapp=restaurantId_${restaurant_id}`);
        const sharedTitle = encodeURI(String(title));
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
        // TODO: Refactor two Navigation Blocks on Restaurant Page
        const handleScroll = () => {
            setHeaderScrolled(window.scrollY > 190); // Если прокрутка больше 190px – меняем состояние
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={classNames(css.header, headerScrolled ? css.scrolled : null)}>
            <div className={css.headerNav}>
                <div className={css.headerTop}>
                    <div className={css.headerNavBlock}>
                        <RoundedButton icon={<BackIcon color={'var(--dark-grey)'} />} action={goBack}></RoundedButton>
                    </div>
                    {headerScrolled ? <span className={css.headerTitle}>{title}</span> : null}
                    <div className={css.headerNavBlock}>
                        <RoundedButton icon={<Share color={'var(--dark-grey)'} />} action={() => shareRestaurant()} />
                        {user && user.complete_onboarding && (
                            <RoundedButton
                                icon={<IconlyProfile color={'var(--dark-grey)'} />}
                                action={() => goToProfile()}
                            />
                        )}
                    </div>
                </div>
                {headerScrolled ? (
                    <RestaurantNavigation
                        isLoading={isLoading}
                        isBanquets={isBanquets}
                        isGastronomy={isGastronomy}
                        isEvents={isEvents}
                    />
                ) : null}
            </div>
        </div>
    );
};
