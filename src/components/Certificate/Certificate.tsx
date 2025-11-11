import React from 'react';
import classnames from 'classnames';
import css from '@/components/Certificate/Certificate.module.css';
import logo from '/img/DT_hospitality_logo_1.png';

interface CertificateProps {
    placeholder: string;
    date: string;
    rating: string;
    cardholder: string;
    big?: boolean;
    forwardRef?: React.Ref<HTMLDivElement>;
}

export const Certificate: React.FC<CertificateProps> = ({ placeholder, date, rating, cardholder, big, forwardRef }) => {
    return (
        <div className={css.certificate} ref={forwardRef}>
            <div className={css.certificateLogo}>
                <img src={logo} alt={'DreamTeam'} />
            </div>
            <span className={classnames(css.placeholder, { [css.bigFont]: big })}>{placeholder}</span>
            <div className={css.certificateData}>
                <div>
                    <span>{cardholder}</span>
                    <span>*********</span>
                </div>
                <div>
                    <span>Действителен:</span>
                    <span>до {date}</span>
                </div>
                <div>
                    <span>Номинал</span>
                    <span>{rating + ' ₽'}</span>
                </div>
            </div>
        </div>
    );
};
