export interface IBanquet {
    banquet_options: IBanquetOptions[];
    additional_options: IBanquetAdditionalOptions[];
    description: string;
    image: string;
}

export interface IBanquetOptionsContainer {
    restaurant_id: number
    options: IBanquetOptions[]
}

export interface IBanquetOptions {
    id: number
    name: string
    guests_min: number | null,
    guests_max: number,
    deposit?: number | null,
    deposit_message: string | null,
    service_fee: number,
    images: string[]
}

export interface IBanquetParams {
    min_guests_number: number
    max_guests_number: number
    banquetType: string[]
    deposit_per_person: number
    service_fee: number
}

export interface IBanquetAdditionalOptions {
    id: number;
    name: string;
}

export interface IBanquetReserve {
    "restaurant_id": number;
    "banquet_option": string;
    "date": string;
    "start_time": string;
    "end_time": string;
    "guests_count": number;
    "occasion": string;
    "additional_services": string[];
    "comment": string;
    "contact_method": string;
    "estimated_cost": number;
}
