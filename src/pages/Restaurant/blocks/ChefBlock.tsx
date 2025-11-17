import React, { useState } from 'react';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import css from '@/pages/Restaurant/Restaurant.module.css';
import classNames from 'classnames';

interface ChefBlockProps {
    about: string;
    photo_url: string;
    chef_name: string;
}

export const ChefBlock: React.FC<ChefBlockProps> = ({ about, photo_url, chef_name }) => {
    const [hideChefAbout, setHideChefAbout] = useState(true);
    const toggleChefInfo = () => {
        setHideChefAbout((prev) => !prev);
    };
    return (
        <ContentContainer>
            <ContentBlock>
                <HeaderContainer>
                    <HeaderContent id={'chef'} title={'О шефе'} />
                </HeaderContainer>
                <div className={css.aboutContainer}>
                    <span className={classNames(css.aboutText, hideChefAbout ? css.trimLines : null)}>{about}</span>
                    <div className={css.trimLinesButton} onClick={toggleChefInfo}>
                        <span className={css.text}>{hideChefAbout ? 'Читать больше' : 'Скрыть'}</span>
                    </div>
                </div>
                <div className={css.chefInfoContainer}>
                    <div
                        className={classNames(css.chefImage, css.bgImage)}
                        style={{ backgroundImage: `url(${photo_url})` }}
                    />
                    <div className={css.chefInfo}>
                        <span className={css.title}>{chef_name}</span>
                        <span className={css.subTitle}>Бренд-шеф</span>
                    </div>
                </div>
            </ContentBlock>
        </ContentContainer>
    );
};