import React from 'react';
import classNames from 'classnames';
// Components
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
// Styles
import css from '@/components/RestaurantPreview/RestrauntPreview.module.css';

/**
 * Skeleton компонент для карточки ресторана.
 * Отображается во время загрузки списка ресторанов.
 * Точно соответствует структуре и размерам реальной карточки RestaurantPreview.
 */
export const RestaurantPreviewSkeleton: React.FC = () => {
    return (
        <div className={css.restaurant} style={{ pointerEvents: 'none' }}>
            {/* Фоновое изображение с aspect-ratio 1:1 как у реальной карточки */}
            <div className={classNames(css.bgImage, css.imaged)} style={{ overflow: 'hidden' }}>
                <PlaceholderBlock width="100%" aspectRatio="1/1" rounded="16px" />
                
                {/* Badges skeleton - соответствует структуре floatingBadges */}
                <div className={css.floatingBadges} style={{ position: 'absolute', bottom: -6, left: 0, right: 0 }}>
                    <div style={{ display: 'flex', gap: 8, padding: '0 15px' }}>
                        <PlaceholderBlock width="130px" height="130px" rounded="12px" />
                        <PlaceholderBlock width="130px" height="130px" rounded="12px" />
                    </div>
                </div>
                
                {/* Chef section skeleton - соответствует imagedBottom */}
                <div className={css.imagedBottom} style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                    <PlaceholderBlock width="54px" height="54px" rounded="50%" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <PlaceholderBlock width="60px" height="12px" rounded="4px" />
                        <PlaceholderBlock width="100px" height="14px" rounded="4px" />
                    </div>
                </div>
            </div>
            
            {/* Info section skeleton */}
            <div className={css.resInfo}>
                <div className={css.resTitleWrapper}>
                    {/* Title - h2.resTitle размер 30px */}
                    <PlaceholderBlock width="60%" height="30px" rounded="8px" />
                    {/* Slogan */}
                    <PlaceholderBlock width="80%" height="14px" rounded="6px" />
                    {/* Address */}
                    <PlaceholderBlock width="70%" height="14px" rounded="6px" />
                </div>
                {/* Tags skeleton - InfoTag компоненты */}
                <div className={css.tags}>
                    <PlaceholderBlock width="80px" height="28px" rounded="14px" />
                    <PlaceholderBlock width="120px" height="28px" rounded="14px" />
                </div>
            </div>
        </div>
    );
};

interface RestaurantPreviewSkeletonListProps {
    count?: number;
}

/**
 * Список skeleton компонентов для ресторанов.
 * 
 * @param count - Количество skeleton элементов (по умолчанию 3)
 */
export const RestaurantPreviewSkeletonList: React.FC<RestaurantPreviewSkeletonListProps> = ({ 
    count = 3 
}) => {
    return (
        <>
            {[...Array(count)].map((_, index) => (
                <RestaurantPreviewSkeleton key={`skeleton-${index}`} />
            ))}
        </>
    );
};

