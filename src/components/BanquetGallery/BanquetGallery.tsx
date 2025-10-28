import { FC, useState } from 'react';
import css from './BanquetGallery.module.css';
import styled from 'styled-components';
import Popup from 'reactjs-popup';
import { DownArrow } from '@/components/Icons/DownArrow.tsx';

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
        width: 100%;
    }
`;

const BanquetGallery: FC<IBanquetGalleryProps> = (p) => {
    const onClose = () => p.setOpen(false);
    const [currentImage, setCurrentImage] = useState(0);

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
                        style={{ transform: 'rotate(90deg)' }}
                        className={css.icon}
                    >
                        <DownArrow size={14} color={'var(--primary-background)'} />
                    </button>
                )}
                <div className={css.imageContainer}>
                    <img
                        src={p.images[currentImage]}
                        alt={''}
                        className={css.currentImage}
                    />
                </div>
                {p.images.length > 1 && (
                    <button
                        onClick={nextImage}
                        style={{ transform: 'rotate(270deg)' }}
                        className={css.icon}
                    >
                        <DownArrow size={14} color={'var(--primary-background)'} />
                    </button>
                )}
            </div>
        </StyledPopup>
    );
}

export default BanquetGallery;