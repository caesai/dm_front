export const DEV_MODE = import.meta.env.MODE === 'development';
export const BASE_URL = DEV_MODE ? 'https://devsoko.ru/api/v1' : 'https://backend.dreamteam.fm/api/v1'
export const ADMIN_URL = DEV_MODE ? `https://devsoko.ru/admin` : 'https://backend.dreamteam.fm/admin';
export const BASE_BOT = DEV_MODE ? 'dmdev1bot' : 'dt_concierge_bot';
export const CLIENT_URL = DEV_MODE ? 'https://caesai.github.io/dm_front' : 'https://tgapp.dreamteam.fm';
// eGift API URL - API для работы с сертификатами eGift
export const EGIFT_API_URL = 'https://api.egift.ru/api';
// eGift API credentials
export const EGIFT_API_TOKEN = 'a5dbf73e46136a1ce6bccea82f4f11532480c97ef70dfb5c82376fc522a1f0cb7350f198fa8c3e42';
export const EGIFT_CLIENT_ID = '1b3e4032-47f1-c0fa-7499-8f6fe03dcf40';
