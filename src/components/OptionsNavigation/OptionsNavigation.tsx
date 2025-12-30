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

interface IOptionsNavigationProps {
    cityId: number;
    isLoading: boolean;
}

export const OptionsNavigation: React.FC<IOptionsNavigationProps> = ({ isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={css.optionsNavigation}>
            <PrivelegiesPopup isOpen={isOpen} setOpen={setIsOpen} />
            <div style={{ display: 'flex', gap: 8 }}>
                <OptionsNavigationElement
                    isLoading={isLoading}
                    title={'Подарочные сертификаты'}
                    img={gastroBtn2}
                    className={css.certificateCTAbtn}
                    link={'/certificates/1'}
                />
                <OptionsNavigationElement
                    isLoading={isLoading}
                    title={'Организовать праздник'}
                    img={gastroBtn3}
                    className={css.banquetsCTAbtn}
                    link={'/banquets/:id/address'}
                />
            </div>
            <OptionsNavigationElement
                isLoading={isLoading}
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
