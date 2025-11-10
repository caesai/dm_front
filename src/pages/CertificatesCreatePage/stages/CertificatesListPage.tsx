import React from 'react';
// import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai/index';
import { Certificate } from '@/components/Certificate/Certificate.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { BASE_BOT } from '@/api/base.ts';
import { ICertificate } from '@/types/certificates.types.ts';
import certificateImage from '/img/certificate_1.png';

export const shareCertificate = async (certificate: ICertificate) => {
    const url = encodeURI(
        `https://t.me/${BASE_BOT}?startapp=certificateId_${certificate.id}`
    );
    // The message includes the full context needed
    const message = `${certificate.recipient_name}, вы получили подарочный сертификат. Перейдите по ссылке ${decodeURI(url)}, чтобы посмотреть его и воспользоваться`;

    try {
        const response = await fetch(certificateImage);
        const blob = await response.blob();
        const sharedFile = new File([blob], 'shared_image.png', { type: 'image/png' });

        const shareDataWithFiles: ShareData = {
            text: message, // Some platforms might use this as a caption
            files: [sharedFile],
            url: decodeURI(url) // Use the URL field for better handling by share targets
        };

        // 1. Check if the platform can share files
        if (navigator.share && navigator.canShare && navigator.canShare(shareDataWithFiles)) {
            try {
                await navigator.share(shareDataWithFiles);
                console.log('Attempted to share both text/url and image (platform dependent).');
                return;
            } catch (error) {
                // If sharing with files fails for some reason, maybe permission issues or API issues
                console.error('Sharing with files failed:', error);
            }
        }

        // 2. If the above didn't work (either canShare returned false or the share() promise rejected),
        //    try sharing just the text/URL as a fallback using the Web Share API
        const shareDataWithoutFiles: ShareData = {
            text: message,
            url: decodeURI(url)
        };
        if (navigator.share && navigator.canShare && navigator.canShare(shareDataWithoutFiles)) {
            await navigator.share(shareDataWithoutFiles);
            console.log('Shared text/url only.');
            return;
        }

        // 3. Final fallback: Use the Telegram specific URL scheme
        // This is the most reliable way to ensure both message and url are present if the native API fails
        window.open(`https://t.me/share/url?url=${url}&text=${encodeURI(message)}`, "_blank");
        console.log('Used Telegram fallback URL.');

    } catch (error) {
        console.error('Error handling image fetch or initial share attempt:', error);
        // If image fetching fails, try sharing text/url as a last resort native share or fallback URL
        if (navigator.share) {
            await navigator.share({ text: message, url: decodeURI(url) });
            return;
        }
        window.open(`https://t.me/share/url?url=${url}&text=${encodeURI(message)}`, "_blank");
    }
};

export const CertificatesListPage: React.FC = () => {
    const [certificates] = useAtom(certificatesListAtom);
    return (
        <div className={css.content}>
            {certificates.map((certificate) => (
                <CertificateOption certificate={certificate} key={certificate.id} />
            ))}
        </div>
    );
};

interface CertificateOptionProps {
    certificate: ICertificate;
}

const CertificateOption: React.FC<CertificateOptionProps> = ({ certificate }) => {
    const navigate = useNavigate();

    const openCertificate = () => {
        navigate('/certificates/landing');
    };

    return (
        <div className={css.certificateOption}>
            <Certificate
                placeholder={certificate.message}
                date={moment(certificate.created_at).add(1, 'year').format('DD.MM.YYYY')}
                rating={Number(certificate.value).toFixed().toString()}
                cardholder={certificate.recipient_name}
            />
            <UniversalButton width={'full'} title={'Поделиться'} action={() => shareCertificate(certificate)} />
            <UniversalButton width={'full'} title={'Открыть'} theme={'red'} action={openCertificate} />
        </div>
    )
}
