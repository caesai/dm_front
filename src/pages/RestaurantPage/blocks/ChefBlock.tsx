import React, { useState } from 'react';
import classNames from 'classnames';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';

interface ChefBlockProps {
    about: string;
    photo_url: string;
    chef_name: string;
}

export const ChefBlock: React.FC<ChefBlockProps> = ({ about, photo_url, chef_name }) => {
    const [isChefAboutCollapsed, setIsChefAboutCollapsed] = useState(true);

    /**
     * Переключает состояние свертывания/развертывания текста о шефе
     */
    const toggleChefInfo = () => {
        setIsChefAboutCollapsed(prev => !prev);
    };

    return (
        <ContentContainer>
            <ContentBlock>
                <HeaderContainer>
                    <HeaderContent id="chef" title="О шефе" />
                </HeaderContainer>

                {/* Блок с текстом о шефе */}
                <div className={css.aboutContainer}>
                    <span
                        className={classNames(
                            css.aboutText,
                            isChefAboutCollapsed && css.trimLines
                        )}
                    >
                        {about}
                    </span>
                    <div
                        className={css.trimLinesButton}
                        onClick={toggleChefInfo}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && toggleChefInfo()}
                    >
                        <span className={css.text}>
                            {isChefAboutCollapsed ? 'Читать больше' : 'Скрыть'}
                        </span>
                    </div>
                </div>

                {/* Информация о шефе */}
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