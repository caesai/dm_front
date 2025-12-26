import React from 'react';
// Components
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
// Styles
import css from '@/pages/RestaurantPage/RestaurantPage.module.css';

/**
 * Skeleton для блока галереи
 */
export const GalleryBlockSkeleton: React.FC = () => {
    return (
        <ContentContainer>
            <ContentBlock>
                <HeaderContainer>
                    <PlaceholderBlock width="100px" height="24px" rounded="8px" />
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <PlaceholderBlock width="70px" height="32px" rounded="16px" />
                        <PlaceholderBlock width="80px" height="32px" rounded="16px" />
                        <PlaceholderBlock width="90px" height="32px" rounded="16px" />
                    </div>
                </HeaderContainer>
                <div className={css.photoSliderContainer}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <PlaceholderBlock width="200px" height="150px" rounded="12px" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <PlaceholderBlock width="100px" height="71px" rounded="12px" />
                            <PlaceholderBlock width="100px" height="71px" rounded="12px" />
                        </div>
                        <PlaceholderBlock width="200px" height="150px" rounded="12px" />
                    </div>
                </div>
            </ContentBlock>
        </ContentContainer>
    );
};

/**
 * Skeleton для блока "О месте"
 */
export const AboutBlockSkeleton: React.FC = () => {
    return (
        <ContentContainer>
            <ContentBlock>
                <HeaderContainer>
                    <PlaceholderBlock width="90px" height="24px" rounded="8px" />
                </HeaderContainer>
                <div className={css.aboutContainer}>
                    <PlaceholderBlock width="100%" height="16px" rounded="6px" />
                    <div style={{ height: 8 }} />
                    <PlaceholderBlock width="100%" height="16px" rounded="6px" />
                    <div style={{ height: 8 }} />
                    <PlaceholderBlock width="80%" height="16px" rounded="6px" />
                    <div style={{ height: 12 }} />
                    <PlaceholderBlock width="100px" height="20px" rounded="6px" />
                </div>
            </ContentBlock>

            <ContentBlock>
                <div className={css.infoBlock}>
                    <div className={css.top}>
                        <PlaceholderBlock width="120px" height="20px" rounded="6px" />
                        <PlaceholderBlock width="80px" height="20px" rounded="6px" />
                    </div>
                </div>
            </ContentBlock>

            <ContentBlock>
                <div className={css.infoBlock}>
                    <PlaceholderBlock width="80px" height="20px" rounded="6px" />
                    <div style={{ height: 12 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                        <PlaceholderBlock width="60px" height="16px" rounded="6px" />
                        <PlaceholderBlock width="150px" height="16px" rounded="6px" />
                    </div>
                    <div style={{ height: 8 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                        <PlaceholderBlock width="90px" height="16px" rounded="6px" />
                        <PlaceholderBlock width="120px" height="16px" rounded="6px" />
                    </div>
                    <div style={{ height: 8 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                        <PlaceholderBlock width="100px" height="16px" rounded="6px" />
                        <PlaceholderBlock width="70px" height="16px" rounded="6px" />
                    </div>
                </div>
            </ContentBlock>
        </ContentContainer>
    );
};

/**
 * Skeleton для блока шеф-повара
 */
export const ChefBlockSkeleton: React.FC = () => {
    return (
        <ContentContainer>
            <ContentBlock>
                <HeaderContainer>
                    <PlaceholderBlock width="100px" height="24px" rounded="8px" />
                </HeaderContainer>
                <div className={css.aboutContainer}>
                    <PlaceholderBlock width="100%" height="16px" rounded="6px" />
                    <div style={{ height: 8 }} />
                    <PlaceholderBlock width="100%" height="16px" rounded="6px" />
                    <div style={{ height: 8 }} />
                    <PlaceholderBlock width="60%" height="16px" rounded="6px" />
                </div>
                <div className={css.chefInfoContainer}>
                    <PlaceholderBlock width="64px" height="64px" rounded="50%" />
                    <div className={css.chefInfoList}>
                        <div className={css.chefInfo}>
                            <PlaceholderBlock width="120px" height="18px" rounded="6px" />
                            <div style={{ height: 4 }} />
                            <PlaceholderBlock width="80px" height="14px" rounded="6px" />
                        </div>
                    </div>
                </div>
            </ContentBlock>
        </ContentContainer>
    );
};

/**
 * Skeleton для блока с адресом и картой
 */
export const AddressBlockSkeleton: React.FC = () => {
    return (
        <ContentContainer>
            <ContentBlock>
                <HeaderContainer>
                    <PlaceholderBlock width="80px" height="24px" rounded="8px" />
                </HeaderContainer>
                <PlaceholderBlock width="100%" height="200px" rounded="16px" />
                <div style={{ height: 12 }} />
                <PlaceholderBlock width="70%" height="16px" rounded="6px" />
            </ContentBlock>
        </ContentContainer>
    );
};

/**
 * Skeleton для блока меню
 */
export const MenuBlockSkeleton: React.FC = () => {
    return (
        <ContentContainer>
            <ContentBlock>
                <HeaderContainer>
                    <PlaceholderBlock width="60px" height="24px" rounded="8px" />
                </HeaderContainer>
                <div style={{ display: 'flex', gap: 8, overflow: 'hidden' }}>
                    <PlaceholderBlock width="150px" height="200px" rounded="12px" minWidth="150px" />
                    <PlaceholderBlock width="150px" height="200px" rounded="12px" minWidth="150px" />
                    <PlaceholderBlock width="150px" height="200px" rounded="12px" minWidth="150px" />
                </div>
            </ContentBlock>
        </ContentContainer>
    );
};

/**
 * Skeleton для блока событий
 */
export const EventsBlockSkeleton: React.FC = () => {
    return (
        <ContentContainer>
            <ContentBlock>
                <HeaderContainer>
                    <PlaceholderBlock width="120px" height="24px" rounded="8px" />
                </HeaderContainer>
                <PlaceholderBlock width="100%" height="180px" rounded="16px" />
                <div style={{ height: 12 }} />
                <PlaceholderBlock width="100%" height="180px" rounded="16px" />
            </ContentBlock>
        </ContentContainer>
    );
};

/**
 * Полный skeleton для страницы ресторана (все блоки)
 */
export const RestaurantPageContentSkeleton: React.FC = () => {
    return (
        <>
            <GalleryBlockSkeleton />
            <MenuBlockSkeleton />
            <AboutBlockSkeleton />
            <ChefBlockSkeleton />
            <AddressBlockSkeleton />
        </>
    );
};

