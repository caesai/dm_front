import React from 'react';
// Components
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
// Styles
import css from '@/components/RestaurantPreview/RestrauntPreview.module.css';

/**
 * Skeleton компонент для карточки ресторана.
 * Отображается во время загрузки списка ресторанов.
 */
export const RestaurantPreviewSkeleton: React.FC = () => {
    return (
        <div className={css.restaurant} style={{ pointerEvents: 'none' }}>
            {/* Фоновое изображение */}
            <div className={css.bgImage} style={{ overflow: 'hidden' }}>
                <PlaceholderBlock width="100%" height="100%" rounded="20px 20px 0 0" />
                
                {/* Badges skeleton */}
                <div className={css.floatingBadges} style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                    <div style={{ display: 'flex', gap: 8, padding: '0 15px' }}>
                        <PlaceholderBlock width="130px" height="80px" rounded="12px" />
                        <PlaceholderBlock width="130px" height="80px" rounded="12px" />
                    </div>
                </div>
            </div>
            
            {/* Info section skeleton */}
            <div className={css.resInfo}>
                <div className={css.resTitleWrapper}>
                    <PlaceholderBlock width="60%" height="24px" rounded="8px" />
                    <div style={{ height: 8 }} />
                    <PlaceholderBlock width="80%" height="16px" rounded="6px" />
                    <div style={{ height: 4 }} />
                    <PlaceholderBlock width="70%" height="14px" rounded="6px" />
                </div>
                {/* Tags skeleton */}
                <div className={css.tags}>
                    <PlaceholderBlock width="80px" height="28px" rounded="14px" />
                    <PlaceholderBlock width="100px" height="28px" rounded="14px" />
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

