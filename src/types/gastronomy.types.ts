export interface INutritionInfo {
    calories: string;
    proteins: string;
    fats: string;
    carbs: string;
}

export interface IAllergen {
    code: string;
    name: string;
}

export interface IDish {
    id: number;
    title: string;
    guest_title?: string;
    prices: number[];
    weights: string[];
    image_url: string;
    description: string;
    nutritionPer100g?: INutritionInfo;
    allergens: IAllergen[];
}

export type TDeliveryMethod = "pickup" | "delivery";

export interface ITimeWindow {
    date: string; // "25 декабря"
    time: string; // "12:00-15:00"
}

export interface IOrderItem {
    id: number;
    title: string;
    quantity: number;
    price: number; // цена за единицу
}

export interface ISendOrder {
    items: IOrderItem[];
    restaurant_id: number;
    total_amount: number;
    delivery_method: TDeliveryMethod;
    delivery_address?: string;
    delivery_cost: number;
}

export interface IOrder extends ISendOrder {
    order_id: string;
    status: "paid" | "pending" | "canceled";
    pickup_time?: ITimeWindow;
    delivery_time?: ITimeWindow;
    createdAt: string;
}
