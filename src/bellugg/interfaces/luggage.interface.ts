import { FormatResultService, DefaultStatus } from '../interfaces'

export interface BookingLuggage {
    id: number
    amount?: number
    orderId?: number
}

export interface LuggageSizeFormat {
    status: boolean
    data: LuggageSize[]
}

export interface LuggageSize {
    id: number
    name: string
    thumbnail: string
    description?: string
    price: number
    currency: string
    unitDetail: string
}

export interface FormatUpdateLuggages<T> extends FormatResultService<T> {}
