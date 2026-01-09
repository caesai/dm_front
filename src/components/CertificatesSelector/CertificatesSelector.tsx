
import React, { useState, useMemo, useEffect } from 'react';
import classnames from 'classnames';
import moment from 'moment/moment';
import { useAtom } from 'jotai/index';
// Atoms
import { certificatesListAtom } from '@/atoms/certificatesListAtom.ts';
// Types
import { TCertificate, CERTIFICATION_TYPES, ICertificate } from '@/types/certificates.types.ts';
// Components
import { CheckBoxInput } from '@/components/CheckBoxInput/CheckBoxInput.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer';
// Styles
import css from '@/components/CertificatesSelector/CertificatesSelector.module.css';


interface ICertificateOptionProps {
    onClick: () => void;
    isSelected: boolean;
    value: string;
    date: string;
}

/**
 * Компонент опции сертификата
 * @param {ICertificateOptionProps} props
 * @returns {JSX.Element}
 */
const CertificateOption: React.FC<ICertificateOptionProps> = ({ onClick, value, date, isSelected }: ICertificateOptionProps): JSX.Element => (
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

interface ICertificateTypeSelectorProps {
    type: TCertificate;
    currentType: TCertificate | null;
    toggleType: (type: TCertificate) => void;
    label: string;
    children?: React.ReactNode;
}

/**
 * Компонент селектора типа сертификата
 * @param {ICertificateTypeSelectorProps} props
 * @returns {JSX.Element}
 */
const CertificateTypeSelector: React.FC<ICertificateTypeSelectorProps> = ({ type, currentType, toggleType, label, children }: ICertificateTypeSelectorProps): JSX.Element => (
    <div className={css.certificateOption} data-testid="certificates-selector">
        <CheckBoxInput
            checked={currentType === type}
            toggle={() => toggleType(type)}
            label={label}
            noBackground
        />
        {currentType === type && children}
    </div>
);

/**
 * Свойства (Props) компонента CertificatesSelector.
 * @interface
 */
export interface ICertificatesSelectorProps {
    /** Функция для установки ID выбранного сертификата в родительском компоненте. */
    setCertificateId: (id: string | null) => void;
    /** Булево значение, указывающее, открыт ли (виден) в данный момент селектор. */
    isOpened: boolean;
    /** ID текущего выбранного сертификата, переданный из родительского компонента. */
    selectedCertificateId: string | null;
}

/**
 * Компонент селектора, который позволяет пользователям выбирать между онлайн и оффлайн сертификатами.
 * Он управляет локальным состоянием для выбранного типа и индекса онлайн-сертификата, а также синхронизирует итоговый ID выбранного сертификата с родительским компонентом.
 *
 * Использует Jotai для глобального управления состоянием списка сертификатов и хуки useState/useEffect React для локальной логики пользовательского интерфейса и побочных эффектов.
 *
 * @param {ICertificatesSelectorProps} { setCertificateId, isOpened, selectedCertificateId }
 * @returns {JSX.Element} Функциональный компонент React или <></>, если сертификаты отсутствуют.
 */
export const CertificatesSelector: React.FC<ICertificatesSelectorProps> = ({ setCertificateId, isOpened, selectedCertificateId }: ICertificatesSelectorProps): JSX.Element => {
    const [certificates] = useAtom(certificatesListAtom);
    const [selectedType, setSelectedType] = useState<TCertificate | null>(null);
    // const [offlineCertificateId, setOfflineCertificateId] = useState<string>('');
    const [selectedOnlineOptionIndex, setSelectedOnlineOptionIndex] = useState<number | null>(null);
    /**
     * Мемоизированный список сертификатов, которые относятся конкретно к типу 'ONLINE'.
     * @type {ICertificate[]}
     */
    const onlineCertificates: ICertificate[] = useMemo(() => {
        return certificates.filter(certificate => certificate.certificate_type === CERTIFICATION_TYPES.ONLINE);
    }, [certificates]);
    /**
     * Переключает выбор опции онлайн-сертификата по индексу.
     * Если нажатый индекс уже был выбран, он снимает выбор (устанавливает null); в противном случае выбирает новый индекс.
     * @param {number} index Индекс опции онлайн-сертификата в списке `onlineCertificates`.
     */
    const toggleSelectedOnlineOption = (index: number) => {
        setSelectedOnlineOptionIndex(prevIndex => prevIndex === index ? null : index);
    };

    /**
     * Переключает основной тип выбираемого сертификата (онлайн/оффлайн).
     * Обновляет состояние `selectedType` и обрабатывает логику для списков с единственным вариантом или сброса других состояний выбора.
     * @param {TCertificate} type Тип сертификата для выбора (например, 'ONLINE', 'OFFLINE').
     */
    const toggleCertificateType = (type: TCertificate) => {
        setSelectedType(prevType => prevType === type ? null : type);
        const filteredCertificates = certificates.filter(certificate => certificate.certificate_type === type);
        if (filteredCertificates.length === 1) {
            setCertificateId(filteredCertificates[0].id);
            setSelectedOnlineOptionIndex(0);
        }
        // Опционально, сброс других выборов при смене типа
        if (type === CERTIFICATION_TYPES.OFFLINE) {
            setSelectedOnlineOptionIndex(null);
        } else {
            // setOfflineCertificateId('');
        }
    };

    /**
     * Хук эффекта для синхронизации локального состояния `selectedOnlineOptionIndex` с функцией `setCertificateId` родительского компонента.
     * Выполняется при каждом изменении `selectedOnlineOptionIndex`.
     */
    useEffect(() => {
        let certificateId = null;
        if (selectedOnlineOptionIndex !== null) {
            certificateId = certificates.find((_item, index) => index === selectedOnlineOptionIndex)?.id || null;
        }
        setCertificateId(certificateId);
    }, [selectedOnlineOptionIndex]);

    /**
     * Хук эффекта для восстановления локального состояния компонента при его открытии на основе существующего `selectedCertificateId` из родителя.
     * Выполняется при изменении `isOpened`, `selectedCertificateId` или `setCertificateId`.
     */
    useEffect(() => {
        if (isOpened && selectedCertificateId) {
            setSelectedType(CERTIFICATION_TYPES.ONLINE);
            let certificateId = null;
            let certificateIndex = null;
            if (selectedCertificateId) {
                certificateId = certificates.find((item) => item.id === selectedCertificateId)?.id || null;
                certificateIndex = certificates.findIndex((item) => item.id === selectedCertificateId);
            }

            if (typeof certificateIndex === 'number' && certificateIndex >= 0) {
                setSelectedOnlineOptionIndex(certificateIndex);
                setCertificateId(certificateId);
            }
        }
    }, [isOpened, selectedCertificateId, setCertificateId, certificates]);

    if (certificates.length === 0) {
        return <></>;
    }

    return (
        <ContentContainer className={css.certificatesSelector}>
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
        </ContentContainer>
    );
};
