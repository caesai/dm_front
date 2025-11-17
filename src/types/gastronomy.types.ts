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
    price: number;
    defaultWeight: string;
    weights: string[];
    image: string;
    composition: string[];
    nutritionPer100g: INutritionInfo;
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

export interface IOrder {
    orderId: string;
    restaurant_id: number;
    status: "paid" | "pending" | "canceled";
    items: IOrderItem[];
    totalAmount: number;
    deliveryMethod: TDeliveryMethod;
    deliveryCost: number;
    pickupTime?: ITimeWindow;
    deliveryTime?: ITimeWindow;
    deliveryAddress?: string;
    createdAt: string;
}
