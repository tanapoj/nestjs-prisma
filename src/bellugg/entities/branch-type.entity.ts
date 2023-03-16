import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

export interface BranchTypeProps {
    name: string
    description?: string
}

export abstract class BranchTypeRelations {}

export interface BranchTypeInterface extends BranchTypeProps {}

@Entity('Branch_type')
export class BranchType extends BranchTypeRelations implements BranchTypeInterface {
    @PrimaryGeneratedColumn()
    branch_type_id!: number

    @Column()
    name!: string

    @Column()
    description?: string
}
