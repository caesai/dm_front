import React, { useState } from 'react';
import classNames from 'classnames';
// Components
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
// Styles
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';

interface ChefBlockProps {
    about: string;
    photo_url: string;
    chef_names: string[];
}

export const ChefBlock: React.FC<ChefBlockProps> = ({ about, photo_url, chef_names }) => {
    const [isChefAboutCollapsed, setIsChefAboutCollapsed] = useState(true);

    /**
     * Переключает состояние свертывания/развертывания текста о шефе
     */
    const toggleChefInfo = () => {
        setIsChefAboutCollapsed((prev) => !prev);
    };

    return (
        <ContentContainer>
            <ContentBlock>
                <HeaderContainer>
                    <HeaderContent id="chef" title="О шефе" />
                </HeaderContainer>

                {/* Блок с текстом о шефе */}
                <div className={css.aboutContainer}>
                    <span className={classNames(css.aboutText, isChefAboutCollapsed && css.trimLines)} dangerouslySetInnerHTML={{ __html: about.replace(/\\n/g, '\n') }}></span>
                    <div
                        className={css.trimLinesButton}
                        onClick={toggleChefInfo}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && toggleChefInfo()}
                    >
                        <span className={css.text}>{isChefAboutCollapsed ? 'Читать больше' : 'Скрыть'}</span>
                    </div>
                </div>

                {/* Информация о шефе */}
                <div className={css.chefInfoContainer}>
                    <div
                        className={classNames(css.chefImage, css.bgImage)}
                        style={{ backgroundImage: `url(${photo_url})` }}
                    />
                    <div className={css.chefInfoList}>
                        {chef_names?.map((name) => (
                            <div className={css.chefInfo} key={name}>
                                <span className={css.title}>{name}</span>
                                <span className={css.subTitle}>Бренд-шеф</span>
                            </div>
                        ))}
                    </div>
                </div>
            </ContentBlock>
        </ContentContainer>
    );
};
