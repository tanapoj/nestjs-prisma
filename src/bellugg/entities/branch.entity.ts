import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

export interface BranchProps {
    branch_type_id: number
    branch_name: string
    branch_location: string
    create_by?: string
    crate_date?: Date
    update_by?: Date
    update_date?: Date
    active: number
    group_area_no: number
    limousine_support?: number
    symbol?: string
    ip_printer?: string
    place_id?: string
}

export abstract class BranchRelations {}

export interface BranchInterface extends BranchProps {}

@Entity('Branch')
export class Branch extends BranchRelations implements BranchInterface {
    @PrimaryGeneratedColumn()
    branch_id!: number

    @Column()
    branch_type_id!: number

    @Column()
    branch_name!: string

    @Column()
    branch_location!: string

    @Column()
    create_by?: string

    @Column()
    crate_date?: Date

    @Column()
    update_by?: Date

    @Column()
    update_date?: Date

    @Column()
    active!: number

    @Column()
    group_area_no!: number

    @Column()
    limousine_support?: number

    @Column()
    symbol?: string

    @Column()
    ip_printer?: string

    @Column()
    place_id?: string
}
