import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToMany,
  ManyToOne,
} from 'typeorm';

export interface AgentTypeProps {
  type: string;
  description?: string;
  pay_out: number;
}

export abstract class AgentTypeRelations {}

export interface AgentTypeInterface extends AgentTypeProps {}

@Entity('Agent_type')
export class AgentType
  extends AgentTypeRelations
  implements AgentTypeInterface
{
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  type!: string;

  @Column()
  description?: string;

  @Column()
  pay_out!: number;
}
