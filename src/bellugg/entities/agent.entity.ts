import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

export interface AgentProps {
    agent_name: string
    agent_address: string
    agent_phone: string
    referent_number?: string
    account_bank?: string
    account_number?: string
    account_type?: string
    agent_user: string
    agent_password: string
    agent_type_id: number
    agent_status?: number
    create_by?: string
    crate_date?: Date
    update_by?: string
    update_date?: Date
    agent_email?: string
    permission_role?: string
    sale_type?: string
    user_sale_id?: string
    img_profile_logo?: string
    is_send_email?: number
    api_key?: string
    language_voucher?: string
}

export abstract class AgentRelations {}

export interface AgentInterface extends AgentProps {}

@Entity('Agent')
export class Agent extends AgentRelations implements AgentInterface {
    @PrimaryGeneratedColumn()
    agent_id!: number

    @Column()
    agent_name!: string

    @Column()
    agent_type_id!: number

    @Column()
    agent_address!: string

    @Column()
    agent_phone!: string

    @Column()
    referent_number?: string

    @Column()
    account_bank?: string

    @Column()
    account_number?: string

    @Column()
    account_type?: string

    @Column()
    agent_user!: string

    @Column()
    agent_password!: string

    @Column()
    agent_status?: number

    @Column()
    create_by?: string

    @Column()
    crate_date?: Date

    @Column()
    update_by?: string

    @Column()
    update_date?: Date

    @Column()
    agent_email?: string

    @Column()
    permission_role?: string

    @Column()
    sale_type?: string

    @Column()
    user_sale_id?: string

    @Column()
    img_profile_logo?: string

    @Column()
    is_send_email?: number

    @Column()
    api_key?: string

    @Column()
    language_voucher?: string
}
