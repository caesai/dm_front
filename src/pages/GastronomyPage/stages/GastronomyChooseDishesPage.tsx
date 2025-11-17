import React from 'react';
import { mockGastronomyListData } from '@/__mocks__/gastronomy.mock.ts';
import { IDish } from '@/types/gastronomy.types.ts';
import css from '@/pages/GastronomyPage/GastronomyPage.module.css';
import { useNavigate, useParams } from 'react-router-dom';

export const GastronomyChooseDishesPage: React.FC = () => {
    const navigate = useNavigate();
    const { res_id } = useParams();
    const navigateToDishDetails = (dishId: number) => {
        navigate(`/gastronomy/${res_id}/dish/${dishId}`);
    }
    return (
        <div>
            {mockGastronomyListData.map((item) => (
                <Dish
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    price={item.price}
                    defaultWeight={item.defaultWeight}
                    weights={item.weights}
                    image={item.image}
                    composition={item.composition}
                    nutritionPer100g={item.nutritionPer100g}
                    allergens={item.allergens}
                    onClick={() => navigateToDishDetails(item.id)}
                />
            ))}
        </div>
    );
};

interface DishProps extends IDish {
    onClick: () => void;
}

const Dish: React.FC<DishProps> = (
    {
        title,
        price,
        defaultWeight,
        image,
        onClick
    },
) => {
    return (
        <div className={css.dish} onClick={onClick}>
            <div className={css.dishImage}>
                <img src={image} alt={title} />
            </div>
            <span>{title}</span>
            <span>{price}</span>
            <span>{defaultWeight}</span>
        </div>
    );
};
