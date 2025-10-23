import React from 'react';
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
import css from '@/components/Stories/StoriesComponents/StoriesLoader.module.css';

interface StoriesLoaderProps {
    isLoading?: boolean;
}

export const StoriesLoader: React.FC<StoriesLoaderProps> = ({ isLoading }) => {
    if (!isLoading) {
        return null;
    }
    return (
        <div className={css.loaderOverlay}>
            <Loader />
        </div>
    )
}
