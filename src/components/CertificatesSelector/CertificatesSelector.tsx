import React, { useState, useMemo, useEffect } from 'react';
import classnames from 'classnames';
import moment from 'moment/moment';
import { useAtom } from 'jotai/index';

import { CheckBoxInput } from '@/components/CheckBoxInput/CheckBoxInput.tsx';
// import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
import { TCertificate, CERTIFICATION_TYPES } from '@/types/certificates.types.ts';
import css from '@/components/CertificatesSelector/CertificatesSelector.module.css';


interface CertificateOptionProps {
    onClick: () => void;
    isSelected: boolean;
    value: string;
    date: string;
}

const CertificateOption: React.FC<CertificateOptionProps> = ({ onClick, value, date, isSelected }) => (
    <div className={classnames(css.optionRow, { [css.optionSelected]: isSelected })} onClick={onClick}>
        <div className={css.optionColumn}>
            <span>Номинал:</span>
            <span className={css.rating}>{value} ₽</span>
        </div>
        <div className={css.optionColumn}>
            <span>Срок действия</span>
            <span className={css.date}>до {date}</span>
        </div>
    </div>
);

interface CertificateTypeSelectorProps {
    type: TCertificate;
    currentType: TCertificate | null;
    toggleType: (type: TCertificate) => void;
    label: string;
    children?: React.ReactNode;
}

const CertificateTypeSelector: React.FC<CertificateTypeSelectorProps> = ({ type, currentType, toggleType, label, children }) => (
    <div className={css.certificateOption}>
        <CheckBoxInput
            checked={currentType === type}
            toggle={() => toggleType(type)}
            label={label}
            noBackground
        />
        {currentType === type && children}
    </div>
);

interface CertificatesSelectorProps {
    setCertificateId: (id: string | null) => void;
    isOpened?: boolean;
}

export const CertificatesSelector: React.FC<CertificatesSelectorProps> = ({ setCertificateId, isOpened }) => {
    const [certificates] = useAtom(certificatesListAtom);
    // Renamed state variable for clarity
    const [selectedType, setSelectedType] = useState<TCertificate | null>(null);
    // const [offlineCertificateId, setOfflineCertificateId] = useState<string>('');
    // Renamed state variable for clarity
    const [selectedOnlineOptionIndex, setSelectedOnlineOptionIndex] = useState<number | null>(null);

    const onlineCertificates = useMemo(() => {
        return certificates.filter(certificate => certificate.certificate_type === CERTIFICATION_TYPES.ONLINE);
    }, [certificates]);

    const toggleSelectedOnlineOption = (index: number) => {
        setSelectedOnlineOptionIndex(prevIndex => prevIndex === index ? null : index);
    };

    const toggleCertificateType = (type: TCertificate) => {
        setSelectedType(prevType => prevType === type ? null : type);
        // Optionally, reset other selections when changing type
        if (type === CERTIFICATION_TYPES.OFFLINE) {
            setSelectedOnlineOptionIndex(null);
        } else {
            // setOfflineCertificateId('');
        }
    };

    useEffect(() => {
        let certificateId = null;
        if (selectedOnlineOptionIndex) {
            certificateId = certificates.find((_item, index) => index === selectedOnlineOptionIndex)?.id || null;
        }
        setCertificateId(certificateId);
    }, [selectedOnlineOptionIndex]);

    useEffect(() => {
        if (isOpened) {
            setSelectedType(CERTIFICATION_TYPES.ONLINE);
        }
    }, []);

    if (certificates.length === 0) {
        return null;
    }

    return (
        <div className={css.certificatesSelector}>
            <CertificateTypeSelector
                type={CERTIFICATION_TYPES.ONLINE}
                currentType={selectedType}
                toggleType={toggleCertificateType}
                label={'Использовать онлайн-сертификат'}
            >
                {onlineCertificates.map((certificate, index) => (
                    <CertificateOption
                        key={certificate.id} // Use unique ID if available, fallback to index
                        onClick={() => toggleSelectedOnlineOption(index)}
                        isSelected={index === selectedOnlineOptionIndex}
                        // Ensure value is formatted correctly as string
                        value={Number(certificate.value).toFixed().toString()}
                        date={moment(certificate.created_at).add(1, 'year').format('DD.MM.YYYY')}
                    />
                ))}
            </CertificateTypeSelector>

            {/*<CertificateTypeSelector*/}
            {/*    type={CERTIFICATION_TYPES.OFFLINE}*/}
            {/*    currentType={selectedType}*/}
            {/*    toggleType={toggleCertificateType}*/}
            {/*    label={'Использовать офлайн-сертификат'}*/}
            {/*>*/}
            {/*    <TextInput*/}
            {/*        value={offlineCertificateId}*/}
            {/*        onChange={(e) => setOfflineCertificateId(e)}*/}
            {/*        placeholder={'Введите ID оффлайн-сертификата'}*/}
            {/*    />*/}
            {/*</CertificateTypeSelector>*/}
        </div>
    );
};
