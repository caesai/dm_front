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
    restaurant_id: number;
    title: string;
    guest_title?: string;
    description: string;
    allergens: string[] | IAllergen[]; // Может быть массивом строк или объектов
    prices: number[];
    weights: string[];
    weight_value?: string;
    calories?: number; // КБЖУ напрямую в объекте
    proteins?: number;
    fats?: number;
    carbohydrates?: number;
    priority?: number;
    image_url: string;
    is_active?: boolean;
    // Старые поля для обратной совместимости
    nutritionPer100g?: INutritionInfo;
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
    delivery_time?: ITimeWindow;
    pickup_time?: ITimeWindow;
    delivery_cost: number;
}

export interface IOrder extends ISendOrder {
    order_id: string;
    status: "paid" | "pending" | "canceled";
    createdAt: string;
}
