import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ImageOrder } from '../../entities'
import { Log } from '../../../logs'

@Injectable()
export class ImageOrderService {
    constructor(
        @InjectRepository(ImageOrder)
        private repo: Repository<ImageOrder>,
        private log: Log,
    ) {}

    public async findOneByOrderId(orderId: number): Promise<{ url: string }[]> {
        return this.repo
            .createQueryBuilder('img')
            .select(['img.image_url AS url'])
            .where('img.order_id = :orderId', { orderId })
            .getRawMany<{ url: string }>()
    }

    public async findByOrderId(orderIds: number[]): Promise<{ url: string; orderId: number }[]> {
        this.log.customDebugLog(orderIds)
        return this.repo
            .createQueryBuilder('img')
            .select(['img.image_url AS url', 'img.order_id AS orderId'])
            .where('img.order_id in (:...orderIds)', { orderIds })
            .getRawMany<{ url: string; orderId: number }>()
    }
}
