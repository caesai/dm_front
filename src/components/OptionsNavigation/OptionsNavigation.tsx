import {
    OptionsNavigationElement,
} from '@/components/OptionsNavigation/OptionsNavigationElement/OptionsNavigationElement.tsx';
import { PrivelegiesPopup } from '@/components/PrivelegiesPopup/PrivelegiesPopup.tsx';
import { useState } from 'react';
import neweventBg from '/img/gastro_btn.png';
import gastroBtn from '/img/gastro_btn1.png';
import gastroBtn2 from '/img/gastro_btn2.png';
import gastroBtn3 from '/img/gastro_btn3.png';
import { mockEventsUsersList } from '@/__mocks__/events.mock.ts';
import css from '@/components/OptionsNavigation/OptionsNavigation.module.css';

export const OptionsNavigation = ({ cityId }: { cityId: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    // const [user] = useAtom(userAtom);
    const tg_id = window?.Telegram?.WebApp?.initDataUnsafe?.user?.id;

    return (
        <div className={css.optionsNavigation}>
            <PrivelegiesPopup isOpen={isOpen} setOpen={setIsOpen} />
            {tg_id && mockEventsUsersList.includes(tg_id) && cityId !== 3 && (
                <OptionsNavigationElement
                    title={'Новогодняя кулинария'}
                    subtitle={'Оформите предзаказ блюд для всей семьи к новогоднему столу'}
                    img={gastroBtn}
                    className={css.gastronomyCTAbtn}
                    link={'/gastronomy/choose'}
                />
            )}
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
                <OptionsNavigationElement
                    title={'Гастро-события'}
                    subtitle={'От уютных ужинов до шумных вечеринок'}
                    img={neweventBg}
                    className={css.eventsCTAbtn}
                    textWrapperClassName={css.eventsTextWrapper}
                    link={'/events'}
                />

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
