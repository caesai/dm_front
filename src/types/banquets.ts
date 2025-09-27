export interface IBanquet {
    image_url: string
    description: string
}

export type IBanquetOptions = {
    id: number
    name: string
    guests_limit: number
    deposit: string
    image_url: string
}