export interface IBanquet {
    imageById: {
        image_url: string
        restaurant_id: number
    }[]
    description: string
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
    image: string
}

export interface IBanquetParams {
    min_guests_number: number
    max_guests_number: number
    banquetType: string[]
    deposit_per_person: number
    service_fee: number
}

export interface IBanquetAdditionalOptions {
    restaurant_id: number
    options: string[]
}