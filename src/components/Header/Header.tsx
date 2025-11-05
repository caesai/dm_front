import css from './Header.module.css';
import { IconlyProfile } from '@/components/Icons/Profile.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai/index';
import { backButtonAtom } from '@/atoms/backButtonAtom.ts';
import logoNew from "/img/DT_concierge_logo_color1.svg";
import { GiftIcon } from '@/components/Icons/GiftIcon.tsx';
import { DEV_MODE } from '@/api/base.ts';
import { IconlyLocation } from '@/components/Icons/Location.tsx';

export const Header = () => {
    const navigate = useNavigate();
    const [, setBackUrlAtom] = useAtom(backButtonAtom);

    const goToProfile = () => {
        setBackUrlAtom('/');
        navigate('/profile');
    };

    return (
        <div className={css.header}>
            <img
                className={css.logo}
                src={logoNew}
                alt="DreamTeam logo"
            />
            <div className={css.buttons}>
                {DEV_MODE ? (
                    <RoundedButton
                    icon={<GiftIcon color={'var(--dark-grey)'} size={44} />}
                    action={() => navigate('/certificates/1')}
                />
                    ) : (
                    <RoundedButton
                        icon={<IconlyLocation color={'var(--dark-grey)'} />}
                        action={() => navigate('/map')}
                    />
                )}

                <RoundedButton
                    icon={<IconlyProfile color={'var(--dark-grey)'} />}
                    action={() => goToProfile()}
                />
            </div>
        </div>
    );
};
