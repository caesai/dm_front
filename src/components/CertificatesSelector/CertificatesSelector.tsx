import React, { useState } from 'react';
import { CheckBoxInput } from '@/components/CheckBoxInput/CheckBoxInput.tsx';
import css from '@/components/CertificatesSelector/CertificatesSelector.module.css';
import { TextInput } from '@/components/TextInput/TextInput.tsx';

export const CertificatesSelector: React.FC = () => {
    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [isOffline, setIsOffline] = useState<boolean>(false);
    const [certificateId, setCertificateId] = useState<string>('');
    const [selectedCertificate, setSelectedCertificate] = useState<number | null>(null);

    const onOptionClick = (index: number) => {
        setSelectedCertificate(index);
    }

    return (
        <div className={css.certificatesSelector}>
            <div className={css.certificateOption}>
                <CheckBoxInput
                    checked={isOnline}
                    toggle={() => {
                        setIsOnline(!isOnline);
                        setIsOffline(false);
                    }}
                    label={'Использовать онлайн-сертификат'}
                    noBackground
                />
                {isOnline && (
                    <>
                        <CertificateOption onClick={onOptionClick} selectedCertificate={selectedCertificate}/>
                    </>
                )}
                <CheckBoxInput
                    checked={isOffline}
                    toggle={() => {
                        setIsOffline(!isOffline);
                        setIsOnline(false);
                    }}
                    label={'Использовать офлайн-сертификат'}
                    noBackground
                />
                {isOffline && (
                    <TextInput
                        value={certificateId}
                        onChange={(e) => setCertificateId(e)}
                        placeholder={'Введите ID оффлайн-сертификата'}
                    />
                )}
            </div>
        </div>
    )
}

interface CertificateOptionProps {
    onClick: (index: number) => void;
    selectedCertificate: number | null;
}

const CertificateOption: React.FC<CertificateOptionProps> = ({ onClick }) => {
    const handleClick = () => {
        onClick(1);
    }
    return (
        <div className={css.optionRow} onClick={handleClick}>
            <div className={css.optionColumn}>
                <span>Номинал:</span>
                <span className={css.rating}>10 000 ₽</span>
            </div>
            <div className={css.optionColumn}>
                <span>Срок действия</span>
                <span className={css.date}>до 10.11.2025</span>
            </div>
        </div>
    )
}
