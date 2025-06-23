export const BASE_URL = import.meta.env.PROD
    ?  import.meta.env.MODE === 'development' ? 'https://devsoko.ru/api/v1' : 'https://backend.dreamteam.fm/api/v1'
    : 'https://localhost:8090/api/v1';

// export const BASE_URL = 'https://backend.dreamteam.fm/api/v1'
export const DEV_MODE = import.meta.env.MODE === 'development';
