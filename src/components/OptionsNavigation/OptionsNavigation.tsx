import React, { useState } from 'react';
// Components
import { OptionsNavigationElement } from '@/components/OptionsNavigation/OptionsNavigationElement/OptionsNavigationElement.tsx';
import { PrivelegiesPopup } from '@/components/PrivelegiesPopup/PrivelegiesPopup.tsx';
// Styles
import css from '@/components/OptionsNavigation/OptionsNavigation.module.css';
// Mocks
import neweventBg from '/img/gastro_btn.png';
import gastroBtn2 from '/img/gastro_btn2.png';
import gastroBtn3 from '/img/gastro_btn3.png';

interface IOptionsNavigationProps {}

export const OptionsNavigation: React.FC<IOptionsNavigationProps> = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={css.optionsNavigation}>
            <PrivelegiesPopup isOpen={isOpen} setOpen={setIsOpen} />
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
                    link={'/banquets/:restaurantId/address'}
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
        </div>
    );
};
