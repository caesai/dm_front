import React from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { IRestaurant } from '@/types/restaurant.types.ts';
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';

interface GastronomyBlockProps {
    image: string
    description: string
    currentRestaurant: IRestaurant;
}

export const GastronomyBlock: React.FC<GastronomyBlockProps> = ({ image, description, currentRestaurant }) => {
    const navigate = useNavigate();

    return (
        <ContentContainer>
            <ContentBlock>
                <HeaderContainer>
                    <HeaderContent title={'Новогодняя кулинария'} id={'ny_cooking'} />
                </HeaderContainer>
                <div className={css.blockContainer}>
                    <div className={css.blockImage}>
                        <div
                            className={classNames(css.blockImage, css.bgImage)}
                            style={{
                                backgroundImage: `url(${image})`,
                            }}
                        ></div>
                    </div>
                    <span className={css.blockDescription}>{description}</span>
                    <UniversalButton
                        width={'full'}
                        title={'Оформить предзаказ'}
                        theme={'red'}
                        action={() => navigate('/gastronomy/choose', { state: { restaurant: currentRestaurant }})}
                    />
                </div>
            </ContentBlock>
        </ContentContainer>
    )
}
