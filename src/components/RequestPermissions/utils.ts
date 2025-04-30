import { requestPhoneAccess } from '@telegram-apps/sdk-react';

export const requestPhone = async (): Promise<string> => {
    return await requestPhoneAccess();
};
