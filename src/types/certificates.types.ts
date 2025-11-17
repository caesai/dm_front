export interface ICertificate {
    id: string;
    customer_id: number;
    payment_id: number | null;
    recipient_id: number;
    certificate_type: TCertificate;
    status: TCertificateStatus;
    value: string;
    recipient_name: string;
    receipt_point: number | null;
    receipt_date: string | null;
    created_at: string;
    updated_at: string;
    shared_at: string | null;
    expired_at: string | null;
    message: string;
}

export interface ICertificateBlockProps {
    image: string;
    description: string;
}

export type TCertificate = 'online' | 'offline';
export type TCertificateStatus = 'new' | 'paid' | 'not_paid' | 'used' | 'shared';

export const CERTIFICATION_TYPES: Record<string, TCertificate> = {
    ONLINE: 'online',
    OFFLINE: 'offline',
};
