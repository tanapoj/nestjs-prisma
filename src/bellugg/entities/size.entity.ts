import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

export interface SizeProps {
    name: string
    price: number
    create_by?: string
    crate_date?: Date
    update_by?: string
    update_date?: Date
    status: number
    size_type_id: number
    branch_condition_id: number
    agent_id?: number
}

export abstract class SizeRelations {}

export interface SizeInterface extends SizeProps {}

@Entity('Size')
export class Size extends SizeRelations implements SizeInterface {
    @PrimaryGeneratedColumn()
    size_id!: number

    @Column()
    name!: string

    @Column()
    price!: number

    @Column()
    create_by?: string

    @Column()
    crate_date?: Date

    @Column()
    update_by?: string

    @Column()
    update_date?: Date

    @Column()
    status!: number

    @Column()
    size_type_id!: number

    @Column()
    branch_condition_id!: number

    @Column()
    agent_id?: number
}
