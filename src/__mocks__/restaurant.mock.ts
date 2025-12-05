import { IRestaurant } from "@/types/restaurant.types";
import newSelfEdgeChinoisThumbnail from '/img/chinois_app.png';

export const mockNewSelfEdgeChinoisRestaurant: IRestaurant = {
    'id': 12,
    'title': 'Self Edge Chinois',
    'slogan': 'Современная Азия с акцентом на Китай и культовый raw bar',
    'address': 'Санкт-Петербург, ул. Добролюбова, 11',
    'logo_url': '',
    'thumbnail_photo': newSelfEdgeChinoisThumbnail,
    'avg_cheque': 3000,
    'about_text': '',
    'about_dishes': 'Европейская',
    'about_kitchen': 'Американская',
    'about_features': '',
    'phone_number': '',
    'address_lonlng': '',
    'address_station': '',
    'address_station_color': '',
    'city': {
        'id': 2,
        'name': 'Санкт-Петербург',
        'name_english': 'spb',
        'name_dative': 'Санкт-Петербурге',
    },
    'gallery': [],
    'brand_chef': {
        'name': '',
        'photo_url': '',
        'about': '',
    },
    'worktime': [],
    'menu': [],
    'menu_imgs': [],
    'socials': [],
    'photo_cards': [],
    openTime: "",
    banquets: {
        banquet_options: [],
        additional_options: [],
        description: '',
        image: '',
    }
}

export const SMOKE_BBQ_MSK_TRUBNAYA_ID = '9';
export const SMOKE_BBQ_SPB_LODEYNOPOLSKAYA_ID = '11';
export const SMOKE_BBQ_RUBINSHTEINA_ID = '6';