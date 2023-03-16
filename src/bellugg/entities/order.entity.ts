import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

export interface OrderProps {
    mem_id?: number
    order_type_id: number
    book_datetime: Date
    order_number: string
    cus_name: string
    cus_passport_no?: string
    cus_email: string
    dropoff_location: string
    dropoff_datetime: Date
    receive_datetime?: Date
    pickup_location?: string
    pickup_datetime: Date
    flight_datetime?: Date
    payment_status: number
    order_status: number
    agent_id: number
    branch_id: number
    zone?: number
    item_index?: number
    driver_id: number
    track_status: number
    process_datetime: Date
    arrived_datetime: Date
    complete_datetime: Date
    create_by?: string
    crate_date?: Date
    update_by?: string
    update_date?: Date
    confirm_dateime?: Date
    cus_sns?: string
    confirm_by?: string
    cus_phone?: string
    tranfer_by?: string
    tranfer_datetime?: Date
    branch_condition_id?: number
    code_id?: number
    is_premiums?: number
    is_luxury?: number
    is_express?: number
    flight_no?: string
    country?: string
    is_confirm?: number
    is_cus_paid_online?: number
    is_insurance_on?: number
    is_subscribe?: number
    language_voucher?: string
    ref_id?: string
    ref_id_legacy?: string
    ref_id_partner?: string
    promotion_id?: number
    currency_code?: string
}

export interface Booking {
    id: number
    bookingNumber: string
    agentBookingNumber: string
    bookingStatus: string
    fullName: string
    email: string
    socialType: string
    socialId: string
    passportNo: string
    citizenId: string
    phone: string
    flightNumber: string
    remark: string
    serviceType: string
    products: Record<string, any>[]
    from: Record<string, any>
    to: Record<string, any>
    imageLuggages: string[]
    agentId: number
}

export abstract class OrderRelations {}

export interface OrderInterface extends OrderProps {}

@Entity('Order')
export class Order extends OrderRelations implements OrderInterface {
    @PrimaryGeneratedColumn()
    order_id!: number

    @Column()
    order_type_id!: number

    @Column()
    mem_id?: number

    @Column()
    book_datetime!: Date

    @Column()
    order_number!: string

    @Column()
    cus_name!: string

    @Column()
    cus_passport_no?: string

    @Column()
    cus_email!: string

    @Column()
    dropoff_location!: string

    @Column()
    dropoff_datetime!: Date

    @Column()
    receive_datetime?: Date

    @Column()
    pickup_location?: string

    @Column()
    pickup_datetime!: Date

    @Column()
    flight_datetime?: Date

    @Column()
    payment_status!: number

    @Column()
    order_status!: number

    @Column()
    agent_id!: number

    @Column()
    branch_id!: number

    @Column()
    zone?: number

    @Column()
    item_index?: number

    @Column()
    driver_id!: number

    @Column()
    track_status!: number

    @Column()
    process_datetime!: Date

    @Column()
    arrived_datetime!: Date

    @Column()
    complete_datetime!: Date

    @Column()
    create_by?: string

    @Column()
    crate_date?: Date

    @Column()
    update_by?: string

    @Column()
    update_date?: Date

    @Column()
    confirm_dateime?: Date

    @Column()
    cus_sns?: string

    @Column()
    confirm_by?: string

    @Column()
    cus_phone?: string

    @Column()
    tranfer_by?: string

    @Column()
    tranfer_datetime?: Date

    @Column()
    branch_condition_id?: number

    @Column()
    code_id?: number

    @Column()
    is_premiums?: number

    @Column()
    is_luxury?: number

    @Column()
    is_express?: number

    @Column()
    flight_no?: string

    @Column()
    country?: string

    @Column()
    is_confirm?: number

    @Column()
    is_cus_paid_online?: number

    @Column()
    is_insurance_on?: number

    @Column()
    is_subscribe?: number

    @Column()
    language_voucher?: string

    @Column()
    ref_id?: string

    @Column()
    ref_id_legacy?: string

    @Column()
    ref_id_partner?: string

    @Column()
    promotion_id?: number

    @Column()
    currency_code?: string
}
