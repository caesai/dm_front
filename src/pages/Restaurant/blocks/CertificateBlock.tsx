import React from 'react';
import { ICertificateBlockProps } from '@/types/certificates.types.ts';
import { useNavigate } from 'react-router-dom';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import css from '@/pages/Restaurant/Restaurant.module.css';
import classNames from 'classnames';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';

export const CertificateBlock: React.FC<ICertificateBlockProps> = ({ image, description }) => {
    const navigate = useNavigate();

    return (
        <ContentContainer>
            <ContentBlock id={'certificates'}>
                <HeaderContainer id={'certificate'}>
                    <HeaderContent title={'Подарочные сертификаты'} />
                </HeaderContainer>
                <div className={css.banquetContainer}>
                    <div className={css.banquetImg}>
                        <div
                            className={classNames(css.banquetImage, css.bgImage)}
                            style={{
                                backgroundImage: `url(${image})`,
                            }}
                        ></div>
                    </div>
                    <span className={css.banquetDescription}>{description}</span>
                    <UniversalButton width={'full'} title={'Подробнее'} action={() => navigate('/certificates/1')} />
                </div>
            </ContentBlock>
        </ContentContainer>
    );
};