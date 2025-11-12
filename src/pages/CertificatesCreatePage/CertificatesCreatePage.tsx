import React from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import classnames from 'classnames';
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';

export const CertificatesCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();
    const state = location?.state;
    const paramsObject = Object.fromEntries(params.entries());
    const isWhiteBackground = !location.pathname.match(/[12]/);
    const isPaymentLocation = location.pathname.includes('payment');

    const goBack = () => {
        if (isPaymentLocation || paramsObject.shared) {
            navigate('/');
        } else {
            navigate(-1);
        }
    };

    return (
        <Page back={true}>
            <div className={classnames(css.page, { [css.whiteBg]: isWhiteBackground })}>
                <div className={css.header}>
                    <RoundedButton
                        bgColor={'var(--primary-background)'}
                        icon={<BackIcon color={'var(--dark-grey)'} />}
                        action={goBack}
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
