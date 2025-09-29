export interface IBanquet {
    image_url: string
    description: string
}

export interface IBanquetOptions {
    id: number
    name: string
    guests_limit: number
    deposit?: string
    conditions?: string
    image_url: string
}

export interface IBanquetParams {
    min_guests_number: number
    max_guests_number: number
    banquetType: string[]
    deposit_per_person: number
    service_fee: number
}