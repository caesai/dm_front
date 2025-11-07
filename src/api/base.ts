export const DEV_MODE = import.meta.env.MODE === 'development';
export const BASE_URL = DEV_MODE ? 'https://devsoko.ru/api/v1' : 'https://backend.dreamteam.fm/api/v1'
export const BASE_BOT = DEV_MODE ? 'dmdev1bot' : 'dt_concierge_bot';
export const CLIENT_URL = DEV_MODE ? 'https://caesai.github.io/dm_front' : 'https://tgapp.dreamteam.fm/';
