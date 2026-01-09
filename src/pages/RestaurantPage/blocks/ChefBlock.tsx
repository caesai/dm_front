import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
// Atoms
import { useGetRestaurantById } from '@/atoms/restaurantsListAtom.ts';
// Components
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
// Styles
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';

/**
 * Пропсы компонента ChefBlock.
 *
 * @    interface IChefBlockProps
 */
interface IChefBlockProps {
    /**
     * ID ресторана.
     */
    restaurantId: string;
}

/**
 * Компонент для отображения информации о шефе.
 *
 * @component
 * @example
 * <ChefBlock restaurantId="1" />
 */
export const ChefBlock: React.FC<IChefBlockProps> = ({ restaurantId }): JSX.Element => {
    /**
     * Ресторан.
     */
    const restaurant = useGetRestaurantById(restaurantId);
    /**
     * Имена шефов.
     */
    const chefNames = useMemo(() => restaurant?.brand_chef?.names || [], [restaurant?.brand_chef?.names]);
    const chefPhotoUrl = useMemo(() => restaurant?.brand_chef?.photo_url || '', [restaurant?.brand_chef?.photo_url]);
    const chefAbout = useMemo(() => restaurant?.brand_chef?.about || '', [restaurant?.brand_chef?.about]);
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
                    <HeaderContent id="chef" title={`О шеф${chefNames?.length > 1 ? 'ах' : 'е'}`} />
                </HeaderContainer>

                {/* Блок с текстом о шефе */}
                <div className={css.aboutContainer}>
                    <span
                        className={classNames(css.aboutText, isChefAboutCollapsed && css.trimLines)}
                        dangerouslySetInnerHTML={{ __html: chefAbout.replace(/\\n/g, '\n') }}
                    ></span>
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
                        style={{ backgroundImage: `url(${chefPhotoUrl})` }}
                    />
                    <div className={css.chefInfoList}>
                        {chefNames?.map((name) => (
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
