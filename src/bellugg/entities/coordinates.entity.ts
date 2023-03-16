import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

export interface CoordinatesProps {
    order_id: number
    place_id_to?: string
    coordinates_to?: string
    area_to?: string
    place_id_from?: string
    coordinates_from?: string
    area_from?: string
}

export abstract class CoordinatesRelations {}

export interface CoordinatesInterface extends CoordinatesProps {}

@Entity('Coordinates')
export class Coordinates extends CoordinatesRelations implements CoordinatesInterface {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    order_id!: number

    @Column()
    place_id_to?: string

    @Column()
    coordinates_to?: string

    @Column()
    area_to?: string

    @Column()
    place_id_from?: string

    @Column()
    coordinates_from?: string

    @Column()
    area_from?: string
}
