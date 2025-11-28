import { OptionsNavigationElement } from '@/components/OptionsNavigation/OptionsNavigationElement/OptionsNavigationElement.tsx';
import {PrivelegiesPopup} from "@/components/PrivelegiesPopup/PrivelegiesPopup.tsx";
import {useState} from "react";
// import { useAtom } from 'jotai/index';
// import {userAtom} from "@/atoms/userAtom.ts";
// import {StarPrivelegyIcon} from "@/components/Icons/StarPrivelegy.tsx";
import { Link } from 'react-router-dom';
import eventBg from '/img/events.jpg';
import neweventBg from '/img/gastro_btn.png';
import gastroBtn from '/img/gastro_btn1.png';
import gastroBtn2 from '/img/gastro_btn2.png';
import gastroBtn3 from '/img/gastro_btn3.png';
import { mockEventsUsersList } from '@/__mocks__/events.mock.ts';
import {DEV_MODE} from "@/api/base.ts";
import css from '@/components/OptionsNavigation/OptionsNavigation.module.css';

export const OptionsNavigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    // const [user] = useAtom(userAtom);
    const tg_id = window?.Telegram?.WebApp?.initDataUnsafe?.user?.id;

    return (
        <div className={css.optionsNavigation}>
            <PrivelegiesPopup isOpen={isOpen} setOpen={setIsOpen} />
            {DEV_MODE && (
                <OptionsNavigationElement
                    title={'Новогодняя кулинария'}
                    subtitle={'Оформите предзаказ блюд для всей семьи к новогоднему столу'}
                    img={gastroBtn}
                    className={css.gastronomyCTAbtn}
                    link={'/gastronomy/choose'}
                />
            )}
            {tg_id && mockEventsUsersList.includes(tg_id) && (
                <div style={{ display: 'flex', gap: 8 }}>
                    <OptionsNavigationElement
                        title={'Подарочные сертификаты'}
                        img={gastroBtn2}
                        className={css.certificateCTAbtn}
                        link={'/certificates/1'}
                    />
                    <OptionsNavigationElement
                        title={'Организовать праздник'}
                        img={gastroBtn3}
                        className={css.banquetsCTAbtn}
                        link={'/banquets/:id/address'}
                    />
                </div>
            )}
            {tg_id && mockEventsUsersList.includes(tg_id) && (
                <OptionsNavigationElement
                    title={'Гастро-события'}
                    subtitle={'От уютных ужинов до шумных вечеринок'}
                    img={neweventBg}
                    className={css.eventsCTAbtn}
                    link={'/events'}
                />
            )}
            {tg_id && !mockEventsUsersList.includes(tg_id) && (
                <div style={{ height: 85}}>
                    <Link to={'/events'}>
                        <img src={eventBg} style={{ maxWidth: '100%', width: '100%', borderRadius: 16 }} alt={''} />
                    </Link>
                </div>
            )}

            {/*{user?.username && ['w0esofwit','egormk', 'iliathoughts', 'Sushkazzlo'].includes(user?.username) && (*/}
            {/*    <div style={{ display: 'flex', width: '50%'}}>*/}
            {/*        <OptionsNavigationElement*/}
            {/*            icon={<StarPrivelegyIcon size={23} color={'var(--light-grey)'}  />}*/}
            {/*            title={'Привилегии'}*/}
            {/*            onClick={() => setIsOpen(!isOpen)}*/}
            {/*        />*/}
            {/*    </div>*/}
            {/*)}*/}
        </div>
    );
};
