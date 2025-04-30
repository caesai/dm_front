import css from './Header.module.css';
import { IconlyProfile } from '@/components/Icons/Profile.tsx';
import { IconlyLocation } from '@/components/Icons/Location.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai/index';
import { backButtonAtom } from '@/atoms/backButtonAtom.ts';

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
                src="/img/logoFull.png"
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
        </div>
    );
};
