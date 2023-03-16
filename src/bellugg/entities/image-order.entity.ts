import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

export interface ImageOrderProps {
    image_type_id: number
    order_id: number
    image_url?: string
}

export abstract class ImageOrderRelations {}

export interface ImageOrderInterface extends ImageOrderProps {}

@Entity('Image_order')
export class ImageOrder extends ImageOrderRelations implements ImageOrderInterface {
    @PrimaryGeneratedColumn()
    im_id!: number

    @Column()
    image_type_id!: number

    @Column()
    order_id!: number

    @Column()
    image_url?: string
}
