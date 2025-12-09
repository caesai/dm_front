import { ICertificate, ICertificateBlockProps } from '@/types/certificates.types.ts';
import certificateImage from '/img/certificate_new.png';

export const certificatesListMock: ICertificate[] = [
    {
        certificate_type: 'online',
        value: '3000.00',
        customer_id: 1388,
        payment_id: null,
        expired_at: '2026-11-10T14:15:53.612313Z',
        recipient_id: 1388,
        recipient_name: 'Great',
        message: 'Britain',
        receipt_point: null,
        receipt_date: null,
        id: 'SUGNS0AG',
        status: 'new',
        created_at: '2025-11-10T14:15:53.614590Z',
        updated_at: '2025-11-10T14:15:53.614590Z',
        shared_at: null,
        dreamteam_id: '',
    },
    {
        certificate_type: 'online',
        value: '5000.00',
        customer_id: 1388,
        payment_id: null,
        expired_at: '2026-11-10T14:10:20.482771Z',
        recipient_id: 1388,
        recipient_name: 'Ff',
        message: 'Vv',
        receipt_point: null,
        receipt_date: null,
        id: 'HZWZLXEM',
        status: 'new',
        created_at: '2025-11-10T14:10:20.485914Z',
        updated_at: '2025-11-10T14:10:20.485914Z',
        shared_at: null,
        dreamteam_id: '',
    },
    {
        certificate_type: 'online',
        value: '5000.00',
        customer_id: 1388,
        payment_id: null,
        expired_at: '2026-11-10T13:42:47.122928Z',
        recipient_id: 1388,
        recipient_name: 'Ff',
        message: 'Vv',
        receipt_point: null,
        receipt_date: null,
        id: 'AVR7A7BF',
        status: 'new',
        created_at: '2025-11-10T13:42:47.125285Z',
        updated_at: '2025-11-10T13:42:47.125285Z',
        shared_at: null,
        dreamteam_id: '',
    },
];

export const mockCertificate: ICertificate = certificatesListMock[0];

export const certificateBlock: ICertificateBlockProps = {
    image: certificateImage,
    description: 'Приятный подарок на любые праздники',
};
