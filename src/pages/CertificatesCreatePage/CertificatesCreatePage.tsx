import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import classnames from 'classnames';
// Components
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
// Styles
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';

export const CertificatesCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    /** State из URL параметров */
    const state = location.state;

    const isWhiteBackground = !location.pathname.match(/[12]/);
    const isPaymentLocation = location.pathname.includes('payment');

    const goPreviousPage = () => {
        if (isPaymentLocation || state?.sharedCertificateCreate) {
            navigate('/');
        } else {
            navigate('/certificates/1');
        }
    };

    return (
        <Page back={true}>
            <div className={classnames(css.page, { [css.whiteBg]: isWhiteBackground })}>
                <div className={css.header}>
                    <RoundedButton
                        bgColor={'var(--primary-background)'}
                        icon={<BackIcon color={'var(--dark-grey)'} />}
                        action={goPreviousPage}
                    />
                    <span className={css.header_title}>
                        {state?.title ? state?.title : 'Сертификат'}
                    </span>
                    <div className={css.spacer} />
                </div>
                <Outlet />
            </div>
        </Page>
    );
};
