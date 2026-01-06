import css from './Header.module.css';
import { IconlyProfile } from '@/components/Icons/Profile.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai/index';
import { backButtonAtom } from '@/atoms/backButtonAtom.ts';
import logoNew from "/img/DT_concierge_logo_color1.svg";
import { IconlyLocation } from '@/components/Icons/Location.tsx';

export const Header = () => {
    const navigate = useNavigate();
    const setBackUrlAtom = useSetAtom(backButtonAtom);

    const goToProfile = () => {
        setBackUrlAtom('/');
        navigate('/profile');
    };

    return (
        <header className={css.header}>
            <img
                className={css.logo}
                src={logoNew}
                alt="DreamTeam logo"
            />
            <div className={css.buttons}>
                <RoundedButton
                    icon={<IconlyLocation color={'var(--dark-grey)'} />}
                    action={() => navigate('/map')}
                />

                <RoundedButton
                    icon={<IconlyProfile color={'var(--dark-grey)'} />}
                    action={() => goToProfile()}
                />
            </div>
        </header>
    );
};
