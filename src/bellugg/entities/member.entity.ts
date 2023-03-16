import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    ManyToMany,
    ManyToOne,
} from 'typeorm'

export interface MemberProps {
    mem_name: string
    mem_county: string
    mem_email: string
    create_by?: string
    crate_date?: Date
    update_by?: string
    update_date?: Date
    mem_status?: number
}

export abstract class MemberRelations {}

export interface MemberInterface extends MemberProps {}

@Entity('Member')
export class Member extends MemberRelations implements MemberInterface {
    @PrimaryGeneratedColumn()
    mem_id!: number

    @Column()
    mem_name!: string

    @Column()
    mem_county!: string

    @Column()
    mem_email!: string

    @Column()
    create_by?: string

    @Column()
    crate_date?: Date

    @Column()
    update_by?: string

    @Column()
    update_date?: Date

    @Column()
    mem_status?: number
}
