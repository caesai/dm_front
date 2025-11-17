import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import css from '@/pages/Restaurant/Restaurant.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { Share } from '@/components/Icons/Share.tsx';
import { IconlyProfile } from '@/components/Icons/Profile.tsx';
import { RestaurantNavigation } from '@/components/RestaurantNavigation/RestaurantNavigation.tsx';
import { mockEventsUsersList } from '@/__mocks__/events.mock.ts';
import { BASE_BOT } from '@/api/base.ts';
import { useAtom } from 'jotai/index';
import { backButtonAtom } from '@/atoms/backButtonAtom.ts';
import { useNavigate } from 'react-router-dom';
import { IRestaurant } from '@/types/restaurant.ts';
import { IEventInRestaurant } from '@/types/events.ts';
import { IBanquet } from '@/types/banquets.types.ts';
import { userAtom } from '@/atoms/userAtom.ts';

interface INavigationBlockProps {
    restaurant_id: number
    restaurant: IRestaurant
    events: IEventInRestaurant[]
    banquets: IBanquet
    filteredEvents: IEventInRestaurant[]
}

export const NavigationBlock: React.FC<INavigationBlockProps> =
    ({
         restaurant_id,
         restaurant,
         events,
         banquets,
         filteredEvents,
    }) => {
    const [headerScrolled, setHeaderScrolled] = useState(false);

    const [, setBackUrlAtom] = useAtom(backButtonAtom);
    const [user] = useAtom(userAtom);
    const navigate = useNavigate();

    const tg_id = window.Telegram.WebApp.initDataUnsafe.user.id;

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
        const url = encodeURI(`https://t.me/${BASE_BOT}?startapp=restaurantId_${restaurant?.id}`);
        const title = encodeURI(String(restaurant?.title));
        const shareData = {
            title,
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
            window.open(`https://t.me/share/url?url=${url}&text=${title}`, '_blank');
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
                        <RoundedButton
                            icon={<BackIcon color={'var(--dark-grey)'} />}
                            action={goBack}
                        ></RoundedButton>
                    </div>
                    {headerScrolled ? <span className={css.headerTitle}>{restaurant?.title}</span> : null}
                    <div className={css.headerNavBlock}>
                        <RoundedButton
                            icon={<Share color={'var(--dark-grey)'} />}
                            action={() => shareRestaurant()}
                        />
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
                        isLoading={events == null && banquets == null}
                        isShow={
                            tg_id &&
                            mockEventsUsersList.includes(tg_id)
                        }
                        isEvents={Boolean(filteredEvents && filteredEvents?.length > 0)}
                    />
                ) : null}
            </div>
        </div>
    )
}
