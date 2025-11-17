import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper.tsx';

export const GastronomyChooseRestaurantPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div>
            <BottomButtonWrapper
                content={'Перейти к списку блюд'}
                onClick={() => navigate('/gastronomy/4')}
            />
        </div>
    )
}
