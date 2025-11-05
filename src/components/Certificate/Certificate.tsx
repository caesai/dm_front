import React from 'react';
import classnames from 'classnames';
import css from '@/components/Certificate/Certificate.module.css';
import logo from '/img/DT_hospitality_logo_eng_black 1.png';

interface CertificateProps {
    placeholder: string;
    date: string;
    rating: string;
    cardholder: string;
    big?: boolean;
}

export const Certificate: React.FC<CertificateProps> = ({ placeholder, date, rating, cardholder, big }) => {
    return (
        <div className={css.certificate}>
            <div className={css.certificateLogo}>
                <img src={logo} alt={'DreamTeam'} />
            </div>
            <div>
                <span className={classnames(css.placeholder, { [css.bigFont] : big })}>
                    {placeholder}
                </span>
            </div>
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
    )
}
