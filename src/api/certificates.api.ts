import axios from 'axios';
import { ADMIN_URL, BASE_URL } from '@/api/base.ts';
import { ICertificate } from '@/types/certificates.types.ts';

export const APIGetCertificates = async (token: string, user_id: number) => {
    return axios.get(`${BASE_URL}/certificates`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            user_id,
            include_shared: true,
        },
    });
};

export const APIGetCertificateById = async (token: string, certificate_id: string) => {
    return axios.get(`${BASE_URL}/certificates/${certificate_id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
            // user_id,
            certificate_id,
        },
    });
}

export const APIPostCreateWithPayment = async (
    token: string,
    user_id: number,
    certificate_type: string,
    value: number,
    recipient_name: string,
    message: string,
) => {
    return axios.post(`${BASE_URL}/certificates/create-with-payment`, {
        user_id,
        certificate_type,
        value,
        recipient_name,
        message,
        // return_url: `${CLIENT_URL}/certificates/payment`,
        return_url: `https://dt-mini-app.local/dm_front/certificates/payment`,
        // fail_url: `${CLIENT_URL}/certificates/error`,
        fail_url: `https://dt-mini-app.local/dm_front/certificates/error`,

    }, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}

export const APIPutCertificateUpdate = async (token: string, certificate_id: string, certificate: ICertificate) => {
    return axios.put(`${ADMIN_URL}/certificates/${certificate_id}`, {
        ...certificate,
    },{
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
}

export const APIPostCertificateClaim = async (token: string, user_id: number, certificate_id: string, recipient_name: string) => {
    return axios.post(`${BASE_URL}/certificates/${certificate_id}/claim`, {
        certificate_id,
        user_id,
        recipient_name,
    },{
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}

export const APIPostCertificateShare = async (token: string, certificate_id: string, recipient_id: number, message: string) => {
    return axios.post(`${ADMIN_URL}/certificates/${certificate_id}/share`, {
        certificate_id,
        recipient_id,
        message,
    },{
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}

export const APIPostCertificateCheckPayment = async (token: string, user_id: number, order_number: string, certificate_id: string) => {
    return axios.post(`${BASE_URL}/alfabank/check-payment-status`, {
        order_number,
        user_id,
        certificate_id
    }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const APIPostCreateAlfaPayment = async (token: string, user_id: number, amount: number) => {
    return axios.post(`${BASE_URL}/alfabank/create-payment`, {
        user_id,
        amount,
    },{
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
};

/**
 * Создает сертификат в eGift после успешной оплаты
 * @param api_token - API токен для eGift
 * @param client_id - ID клиента в eGift
 * @param promo_code - Промокод сертификата (dreamteam_id)
 * @param amount - Номинал сертификата
 * @param source - Источник создания (tma для Telegram Mini App)
 */
export const APIPostEGiftCertificateOffline = async (
    api_token: string,
    client_id: string,
    promo_code: string,
    amount: number,
    source: string = 'tma'
) => {
    return axios.post(`${BASE_URL}/Certificate:Offline`, {
        api_token,
        client_id,
        promo_code,
        amount,
        source,
    });
};

/**
 * Получает информацию о сертификате из eGift, включая баланс
 * @param api_token - API токен для eGift
 * @param promo_code - Промокод сертификата (dreamteam_id)
 */
export const APIPostEGiftCertificateInfo = async (
    api_token: string,
    promo_code: string
) => {
    return axios.post(`${BASE_URL}/Certificate:Info`, {
        api_token,
        promo_code,
    });
};
