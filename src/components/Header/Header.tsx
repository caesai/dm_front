import css from './Header.module.css';
import { useNavigate } from 'react-router-dom';
import { useSetAtom } from 'jotai/index';
import { backButtonAtom } from '@/atoms/backButtonAtom.ts';
import logoNew from "/img/DT_concierge_logo_color1.svg";
import { MenuIcon } from '@/components/Icons/MenuIcon.tsx';

export const Header = () => {
    const navigate = useNavigate();
    const setBackUrlAtom = useSetAtom(backButtonAtom);

    const goToProfile = () => {
        setBackUrlAtom('/');
        navigate('/profile');
    };

    return (
        <header className={css.header}>
            <span className={css.offset} />
            <img
                className={css.logo}
                src={logoNew}
                alt="DreamTeam logo"
            />
            <div className={css.menu} onClick={goToProfile}>
                <MenuIcon size={28} />
            </div>
        </header>
    );
};