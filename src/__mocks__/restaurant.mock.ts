import { IRestaurant } from "@/types/restaurant.types";
import newSelfEdgeChinoisThumbnail from '/img/chinois_app.png';

export const mockNewSelfEdgeChinoisRestaurant: IRestaurant = {
    'id': 99,
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
    },
    brand_chefs: [{
        name: '',
        photo_url: '',
        about: '',
    }]
}

// Restaurant IDs
export const R = {
  BLACKCHOPS_SPB_FONTANKA_RIVER_ID: '1',
  POLY_SPB_BELINSKOGO_ID: '2',
  TRAPPIST_SPB_RADISHEVA_ID: '3',
  SELF_EDGE_SPB_RADISHEVA_ID: '4',
  PAME_SPB_MOIKA_RIVER_ID: '5',
  SMOKE_BBQ_SPB_RUBINSHTEINA_ID: '6',
  SELF_EDGE_EKAT_GOGOLYA: '7',
  SMOKE_BBQ_MSC_TRUBNAYA_ID: '9',
  SELF_EDGE_MSC_BIG_GRUZINSKAYA_ID: '10',
  SMOKE_BBQ_SPB_LODEYNOPOLSKAYA_ID: '11',
  SELF_EDGE_SPB_CHINOIS_ID: '13',
}
