import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page.tsx';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';

export const CertificatesCreatePage: React.FC = () => {
    const navigate = useNavigate();
    // const location = useLocation();
    const goBack = () => {
        navigate(-1);
    };
    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.header}>
                    <RoundedButton
                        bgColor={'var(--primary-background)'}
                        icon={<BackIcon color={'var(--dark-grey)'} />}
                        action={goBack}
                    />
                    <span className={css.header_title}>
                        Сертификат
                    </span>
                    <div className={css.spacer} />
                </div>
                <Outlet />
            </div>
        </Page>
    );
};
