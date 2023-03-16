import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

export interface BranchConditionProps {}

export abstract class BranchConditionRelations {}

export interface BranchConditionInterface extends BranchConditionProps {}

@Entity('Branch_condition')
export class BranchCondition extends BranchConditionRelations implements BranchConditionInterface {
    @PrimaryGeneratedColumn()
    branch_condition_id!: number

    @Column()
    branch_id_from!: number

    @Column()
    branch_id_to!: number

    @Column()
    description?: string
}
