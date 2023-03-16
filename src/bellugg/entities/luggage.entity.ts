import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

export interface LuggageProps {
    size_id: number
    order_id: number
    driver_id?: number
    lug_number: string
    track_status: number
    remark?: string
    create_by?: string
    crate_date?: Date
    update_by?: string
    update_date?: Date
    use_package?: number
    commissiom_on?: number
    new_lugg?: number
    sale_price?: number
}

export abstract class LuggageRelations {}

export interface LuggageInterface extends LuggageProps {}

@Entity('Luggage')
export class Luggage extends LuggageRelations implements LuggageInterface {
    @PrimaryGeneratedColumn()
    lug_id!: number

    @Column()
    size_id!: number

    @Column()
    order_id!: number

    @Column()
    driver_id?: number

    @Column()
    lug_number!: string

    @Column()
    track_status!: number

    @Column()
    remark?: string

    @Column()
    create_by?: string

    @Column()
    crate_date?: Date

    @Column()
    update_by?: string

    @Column()
    update_date?: Date

    @Column()
    use_package?: number

    @Column()
    commissiom_on?: number

    @Column()
    new_lugg?: number

    @Column()
    sale_price?: number
}
