import React, { useEffect, useRef } from 'react';
import moment from 'moment';
import { useAtom, WritableAtom } from 'jotai/index';
import { authAtom, userAtom } from '@/atoms/userAtom.ts';
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
import { BASE_BOT } from '@/api/base.ts';
import { ICertificate } from '@/types/certificates.types.ts';
import { APIGetCertificates } from '@/api/certificates.api.ts';
import { Certificate } from '@/components/Certificate/Certificate.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';

export const shareCertificate = async (certificate: ICertificate, certificateRef: React.Ref<HTMLDivElement | null>) => {
    const url = encodeURI(
        `https://t.me/${BASE_BOT}?startapp=certificateId_${certificate.id}`
    );
    // The message includes the full context needed
    // const message = `${certificate.recipient_name}, вы получили подарочный сертификат. Перейдите по ссылке ${decodeURI(url)}, чтобы посмотреть его и воспользоваться`;
    const message = decodeURI(url);

    try {
        const canvas = await html2canvas(certificateRef as unknown as HTMLElement);
        const imageDataURL = canvas.toDataURL("image/png");
        const byteString = atob(imageDataURL.split(',')[1]);
        const mimeString = imageDataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const imageBlob = new Blob([ab], { type: mimeString });
        const fileName = 'certificate_screenshot.png';
        const imageFile = new File([imageBlob], fileName, { type: mimeString });

        const shareDataWithFiles: ShareData = {
            title: message, // Some platforms might use this as a caption
            files: [imageFile],
            // url: decodeURI(url) // Use the URL field for better handling by share targets
        };

        // 1. Check if the platform can share files
        if (navigator.share) {
            try {
                await navigator.share(shareDataWithFiles);
                console.log('Attempted to share both text/url and image (platform dependent).');
                // return;
            } catch (error) {
                // If sharing with files fails for some reason, maybe permission issues or API issues
                console.error('Sharing with files failed:', error);
            }
        }
        // 3. Fallback: Use the Telegram specific URL scheme
        // This is the most reliable way to ensure both message and url are present if the native API fails
        window.open(`https://t.me/share/url?text=${encodeURI(message)}`, "_blank");

    } catch (error) {
        console.error('Error handling image fetch or initial share attempt:', error);
        // If image fetching fails, try sharing text/url as a last resort native share or fallback URL
        if (navigator.share) {
            await navigator.share({ text: message });
            return;
        }
        window.open(`https://t.me/share/url?url=${url}&text=${encodeURI(message)}`, "_blank");
    }
};

export const CertificatesListPage: React.FC = () => {

    const [certificates, setCertificates] = useAtom(certificatesListAtom as WritableAtom<ICertificate[], [ICertificate[]], void>);
    const [auth] = useAtom(authAtom);
    const [user] = useAtom(userAtom);

    useEffect(() => {
        if (auth?.access_token) {
            APIGetCertificates(auth?.access_token, Number(user?.id))
                .then(response => setCertificates(response.data));
        }
    }, [auth?.access_token, user?.id, setCertificates]);

    return (
        <div className={css.content}>
            {certificates.length > 0 ? (
                certificates.map((certificate) => (
                    <CertificateOption certificate={certificate} key={certificate.id} />
                ))
            ) : (<h2 className={css.empty_list}>Список пуст</h2>)}
        </div>
    );
};

interface CertificateOptionProps {
    certificate: ICertificate;
}

const CertificateOption: React.FC<CertificateOptionProps> = ({ certificate }) => {
    const navigate = useNavigate();
    const certificateRef = useRef(null);
    const useCertificate = () => {
        navigate('/booking', { state: { certificate: true, certificateId: certificate.id } })
    }
    return (
        <div className={css.certificateOption}>
            <Certificate
                placeholder={certificate.message}
                date={moment(certificate.created_at).add(1, 'year').format('DD.MM.YYYY')}
                rating={Number(certificate.value).toFixed().toString()}
                cardholder={certificate.recipient_name}
                dreamteam_id={certificate.dreamteam_id}
                forwardRef={certificateRef}
            />
            {certificate.status === 'paid' && <UniversalButton width={'full'} title={'Поделиться'} theme={'red'} action={() => shareCertificate(certificate, certificateRef.current)} />}
            {certificate.status === 'shared' && <UniversalButton width={'full'} title={'Воспользоваться'} theme={'red'} action={useCertificate} />}
        </div>
    )
}
