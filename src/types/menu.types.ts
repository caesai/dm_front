
export interface IMenuItemSize {
    id: string;
    item_id: string;
    restaurant_id: number;
    sku: string;
    size_code: string;
    size_name: string;
    size_id: string;
    is_default: boolean;
    is_hidden: boolean;
    portion_weight_grams: number;
    measure_unit_type: string;
    button_image_url: string;
    nutrition_per_hundred?: Record<string, any>;
    item_modifier_groups?: Record<string, any>[];
    prices?: Record<string, any>[];
}

export interface IMenuItem {
    id: string;
    category_id: string;
    restaurant_id: number;
    sku: string;
    name: string;
    description: string;
    type: string;
    measure_unit: string;
    allergens?: Record<string, any>[];
    tags?: Record<string, any>[];
    labels?: Record<string, any>[];
    is_hidden: boolean;
    can_be_divided: boolean;
    item_sizes: IMenuItemSize[];
}

export interface IMenuCategory {
    id: string;
    menu_id: string;
    restaurant_id: number;
    name: string;
    description: string;
    button_image_url: string;
    header_image_url: string;
    is_hidden: boolean;
    tags?: Record<string, any>[];
    labels?: Record<string, any>[];
    menu_items: IMenuItem[];
}

export interface IMenu {
    id: string;
    restaurant_id: number;
    external_menu_id: number;
    name: string;
    description: string;
    button_image_url: string;
    revision: number;
    format_version: number;
    item_categories: IMenuCategory[];
}