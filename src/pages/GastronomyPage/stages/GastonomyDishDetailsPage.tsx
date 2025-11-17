import React from 'react';
import css from '@/pages/GastronomyPage/GastronomyPage.module.css';
import { useParams } from 'react-router-dom';

export const GastonomyDishDetailsPage: React.FC = () => {
    const { dish_id } = useParams();

    return (
        <div className={css.container}>
            {dish_id}
        </div>
    )
}
