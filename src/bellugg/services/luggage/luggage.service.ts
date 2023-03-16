import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Luggage, Size } from '../../entities'
import { Log } from '../../../logs'
import { BookingLuggage, LuggageSize, DefaultStatus } from '../../interfaces'
import { BranchService, OldSystemService } from '../../services'
import { UploadImgDto } from '../../models'

@Injectable()
export class LuggageService {
    constructor(
        @InjectRepository(Luggage)
        private repo: Repository<Luggage>,
        @InjectRepository(Size)
        private sizeRepo: Repository<Size>,
        @Inject('BranchService') private branchService: BranchService,
        @Inject('OldSystemService') private oldSystemService: OldSystemService,
        private log: Log,
    ) {}

    public async findOneByOrderId(orderId: number): Promise<BookingLuggage[]> {
        const luggages = await this.repo
            .createQueryBuilder('lug')
            .where('lug.order_id = :orderId', { orderId })
            .select(['lug.lug_id AS id', 'lug.new_lugg AS newLugg', 'lug.size_id AS sizeId', 'lug.order_id AS orderId'])
            .getRawMany<{ id: number; newLugg: number; sizeId: number; orderId: number }>()

        if (luggages.length === 0) return

        const editLuggages = luggages.filter(luggage => luggage.newLugg === 1)
        if (editLuggages.length > 0) {
            return editLuggages
        }

        this.log.customDebugLog(luggages)

        return luggages
    }

    public async findByOrderId(orderIds: number[]): Promise<BookingLuggage[]> {
        const luggages = await this.repo
            .createQueryBuilder('lug')
            .where('lug.order_id in (:...orderIds)', { orderIds })
            .select([
                'lug.lug_id AS id',
                'lug.sale_price AS amount',
                'lug.order_id AS orderId',
                'lug.new_lugg AS newLugg',
                'lug.size_id AS sizeId',
            ])
            .getRawMany<{ id: number; amount: number; orderId: number; newLugg: number; sizeId: number }>()

        return luggages
    }

    public async getBranchIdAvaiable(place: string, placeId?: string): Promise<number> {
        return this.branchService.findOneBranchIdOldSystem(place, placeId)
    }

    public async findOneLuggageSize(
        sizeId: number,
        fromBranchId?: number,
        toBranchId?: number,
    ): Promise<LuggageSize[]> {
        const sizes = await this.sizeRepo.find({ where: { size_id: sizeId } })

        if (sizes == null || sizes.length === 0) return

        const result: LuggageSize[] = sizes.map(size => {
            return {
                id: size.size_id,
                name: size.name,
                thumbnail: `https://system.nestpris.com/image/BookingLugIcon/size_type_${size.size_type_id}.png`,
                description: null,
                price: size.price,
                currency: 'THB',
                unitDetail: 'UNIT',
            }
        })

        return result
    }

    public async updateLuggages(bookingNumber: string, productList: string[]): Promise<DefaultStatus> {
        let result: DefaultStatus = DefaultStatus.FAIL
        const updateLuggages = await this.oldSystemService.updateLuggages(bookingNumber, productList)

        if (updateLuggages == null) {
            result = DefaultStatus.UNKNOWNERROR
            return result
        }

        if (updateLuggages != null && !updateLuggages.status) {
            result = DefaultStatus.UPDATE_LUGGAGES_FAILED
            return result
        }

        if (updateLuggages != null && updateLuggages.status) {
            result = DefaultStatus.SUCCESS
            return result
        }

        return result
    }

    public async updateImg(bookingId: number, productList: UploadImgDto[], imgTypeId: number): Promise<DefaultStatus> {
        let result: DefaultStatus = DefaultStatus.FAIL

        if (productList.length > 0) {
            const updateImgs = await Promise.all(
                productList.map(async item => this.oldSystemService.uploadImgLuggages(bookingId, item, imgTypeId)),
            )

            if (updateImgs.filter(item => item == null || !item?.status).length > 0) {
                result = DefaultStatus.UPDATE_IMGE_LUGGAGES_FAILED
                return result
            } else {
                result = DefaultStatus.SUCCESS
            }
        } else if (productList.length === 0) {
            result = DefaultStatus.SUCCESS
        }

        return result
    }
}
