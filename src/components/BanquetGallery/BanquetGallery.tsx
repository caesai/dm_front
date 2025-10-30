import { FC, useState } from 'react';
import css from './BanquetGallery.module.css';
import styled from 'styled-components';
import Popup from 'reactjs-popup';
import { DownArrow } from '@/components/Icons/DownArrow.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { MiniCrossIcon } from '@/components/Icons/MiniCrossIcon.tsx';

interface IBanquetGalleryProps {
    isOpen: boolean;
    setOpen: (x: boolean) => void;
    images: string[];
}

const StyledPopup = styled(Popup)`
    &-overlay {
        background: rgba(61, 61, 61, 0.8);
    }

    &-content {
        background: transparent;
        border: 0;
        width: fit-content;
    }
`;

const BanquetGallery: FC<IBanquetGalleryProps> = (p) => {
    const [currentImage, setCurrentImage] = useState(0);

    const onClose = () => {
        p.setOpen(false)
        setCurrentImage(0);
    };

    const nextImage = () => {
        setCurrentImage((prev) => {
            if (prev === p.images.length - 1) {
                return 0
            } else {
                return prev + 1
            }
        });
    };

    const prevImage = () => {
        setCurrentImage((prev) => {
            if (prev === 0) {
                return p.images.length - 1
            } else {
                return prev - 1
            }
        });
    };

    return (
        <StyledPopup
            open={p.isOpen}
            onClose={onClose}
            closeOnDocumentClick
            closeOnEscape
        >
            <div className={css.content}>
                {p.images.length > 1 && (
                    <button
                        onClick={prevImage}
                        style={{ transform: 'rotate(90deg)', left: '-24px' }}
                        className={css.icon}
                    >
                        <DownArrow size={16} color={'var(--primary-background)'} />
                    </button>
                )}
                <div className={css.imageContainer} style={{ backgroundImage: `url(${p.images[currentImage]})`, width: p.images.length > 1 ? '310px' : '345px' }}>
                   <div className={css.closeButton}>
                       <RoundedButton
                           icon={<MiniCrossIcon color={'black'} />}
                           bgColor={'var(--primary-background) !important'}
                           action={() => onClose()}
                           style={{
                               width: '24px',
                               height: '24px',
                               minWidth: '24px',
                           }}
                       />
                   </div>
                </div>
                {p.images.length > 1 && (
                    <button
                        onClick={nextImage}
                        style={{ transform: 'rotate(270deg)', right: '-24px' }}
                        className={css.icon}
                    >
                        <DownArrow size={16} color={'var(--primary-background)'} />
                    </button>
                )}
            </div>
        </StyledPopup>
    );
}

export default BanquetGallery;