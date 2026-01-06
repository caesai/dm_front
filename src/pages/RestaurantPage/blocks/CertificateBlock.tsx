import React from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
// Components
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
// Styles
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';
// Mocks
import { certificateBlock } from '@/__mocks__/certificates.mock.ts';

/**
 * 
 * @returns {JSX.Element} Блок сертификата
 */
export const CertificateBlock: React.FC = (): JSX.Element => {
    const navigate = useNavigate();

    /**
     * Обрабатывает навигацию на страницу сертификатов
     */
    const handleNavigateToCertificates = () => {
        navigate('/certificates/1');
    };

    return (
        <ContentContainer>
            <ContentBlock id="certificates">
                <HeaderContainer id="certificate">
                    <HeaderContent title="Подарочные сертификаты" />
                </HeaderContainer>
                <div className={css.blockContainer}>
                    <div className={css.blockImage}>
                        <div
                            className={classNames(css.blockImage, css.bgImage)}
                            style={{ backgroundImage: `url(${certificateBlock.image})` }}
                        />
                    </div>
                    <span className={css.blockDescription}>{certificateBlock.description}</span>
                    <UniversalButton
                        width="full"
                        title="Подробнее"
                        action={handleNavigateToCertificates}
                    />
                </div>
            </ContentBlock>
        </ContentContainer>
    );
};