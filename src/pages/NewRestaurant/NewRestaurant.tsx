import { RestaurantPreview } from '@/components/RestaurantPreview/RestrauntPreview.tsx';
import newres from '/img/chinois_app.png';
import { Page } from '@/components/Page.tsx';
import classNames from 'classnames';
import css from '@/pages/Restaurant/Restaurant.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const NewRestaurant = () => {
    const navigate = useNavigate();

    const [headerScrolled, setHeaderScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setHeaderScrolled(window.scrollY > 190); // Если прокрутка больше 50px – меняем состояние
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    return (
        <Page back={true}>
            <div
                className={classNames(
                    css.header,
                    headerScrolled ? css.scrolled : null
                )}
            >
                <div className={css.headerNav}>
                    <div className={css.headerTop}>
                        <div className={css.headerNavBlock}>
                            <RoundedButton
                                icon={<BackIcon color={'var(--dark-grey)'}/>}
                                action={() => navigate('/')}
                            ></RoundedButton>
                        </div>

                    </div>
                </div>
            </div>
            <div style={{ padding: '20px 15px', marginTop: 50}}>
                <RestaurantPreview
                    // @ts-ignore
                    restaurant={{
                        "id": 12,
                        "title": "Self Edge Chinois",
                        "slogan": "Современная Азия с акцентом на Китай и культовый raw bar",
                        "address": "Санкт-Перербург, ул. Добролюбова, 11",
                        "logo_url": "",
                        "thumbnail_photo": newres,
                        "avg_cheque": 3000,
                        "about_text": "",
                        "about_dishes": "Европейская",
                        "about_kitchen": "Американская",
                        "about_features": "",
                        "phone_number": "",
                        "address_lonlng": "",
                        "address_station": "",
                        "address_station_color": "",
                        "city": {
                            "id": 2,
                            "name": "Санкт-Петербург",
                            "name_english": "spb",
                            "name_dative": "Санкт-Петербурге"
                        },
                        "gallery": [],
                        // @ts-ignore
                        "brand_chef": {},
                        "worktime": [],
                        "menu": [],
                        "menu_imgs": [],
                        "socials": [],
                        "photo_cards": []
                    }}
                    key={`rest-12`}
                    clickable
                />
            </div>
        </Page>
    )
}
