import React, { useEffect, useRef, useState } from 'react';
import Popup from 'reactjs-popup';
import styled from 'styled-components';
// import classNames from 'classnames';
import css from './BannerPopup.module.css';
import banner from '/img/banner.jpg'
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { CrossIcon } from '@/components/Icons/CrossIcon.tsx';
import { getCookie, setShortCookie } from '@/utils.ts';

const StyledPopup = styled(Popup)`
    &-overlay {
        background: #58585869;
        width: 100%;
        margin: 0;
        height: 100vh;
    }

    // use your custom style for ".popup-content"

    &-content {
        padding: 0;
        border-radius: 12px;
        margin: 0!important;
        width: 100%;
        height: 100vh;
        border: none;
    }
`;

export const BannerPopup: React.FC = () => {
    const [open, setOpen] = useState(false);
    const closeBtnRef = useRef<HTMLDivElement | null>(null);
    const bannerCookie = getCookie('banner');
    const closeBanner = () => {
        setOpen(false);
        setShortCookie('banner','show', 600);
    }
    useEffect(() => {
        if (closeBtnRef.current) {
            setTimeout(() => {
                // @ts-ignore
                closeBtnRef.current.style.visibility = 'visible';
            }, 3000);
        }
    }, [closeBtnRef.current]);
    useEffect(() => {
        if (bannerCookie !== 'show') {
            setOpen(true);
        }
    }, []);
    if (!open) return null;
    return (
        <StyledPopup
            open={open}
            onClose={closeBanner}
            closeOnDocumentClick={true}
            className={css.popup}
        >
            <div ref={closeBtnRef} style={{position: 'absolute', top: 10, right: 10, visibility: 'hidden'}}>
                <RoundedButton
                    icon={<CrossIcon size={44} color={'black'} />}
                    bgColor={'var(--primary-background) !important'}
                    action={closeBanner}
                />
            </div>
            <div style={{
                backgroundImage: 'url(' + banner + ')',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                height: '100%',
                width: '100%',
                display: 'flex',
            }} />
        </StyledPopup>
    )
}
