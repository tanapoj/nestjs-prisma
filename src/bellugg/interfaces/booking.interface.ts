import { DefaultStatus, FormatResultService } from '../interfaces'

export enum BookingStatus {
    'Refunds Cancel Customer Not Paid' = -1,
    'Start' = 0,
    'Approve' = 1,
    'Assigned' = 2,
    'Process' = 3,
    'Completed' = 4,
    'Cancel Customer Paid' = 5,
}

export interface OldSystemBookingProps {
    ref_id: string
    drop_location: string
    pickup_location: string
    drop_datetime: string
    pickup_datetime: string
    from_type: string
    to_type: string
    flight_datetime?: string
    express: number
    deluxe: number
    cb_premium: number
    is_insurance_on: number
    is_subscribe: number
    lugList: string[]
    cus_name: string
    cus_email: string
    cus_passport: string
    cus_phone: string
    cus_social: string
    fl?: string
    remark: string
    img_1?: string
    img_2?: string
    img_3?: string
    nationality?: string
    agent: string
    branch_id: string
    branch_condition_id: string
    place_id_to: string
    place_id_from: string
    coordinate_to: string
    coordinate_from: string
    area_to: string
    area_from?: string
    currency_code: string
    create_by: string
}

export interface BookingProps {
    fullName: string
    email: string
    socialType?: string
    socialId?: string
    passport?: string
    phone?: string
    flightNumber?: string
    remark?: string
    serviceType?: string
    products: ProductBookingProps[]
    from: BranchBookingProps
    to: BranchBookingProps
    imageLuggages: string[]
}

export interface ProductBookingProps {
    id: number
    amount: number
}

export interface BranchBookingProps {
    type: string
    id?: number
    lat?: number
    lng?: number
    placeId?: string
    dateTime: string
}

export interface FormatCreateBooking<T> extends FormatResultService<T> {
    status: DefaultStatus
    data: T
}

export interface ResponseBookingDetail {
    id: number
    bookingNumber: string
    agentBookingNumber?: string
}

export enum TrackStatus {
    Booking = 0,
    Confirm = 1,
    Receive = 2,
    Process = 3,
    Arrived = 4,
    Completed = 5,
}
