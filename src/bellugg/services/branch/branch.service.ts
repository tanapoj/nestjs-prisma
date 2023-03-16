import { Injectable, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { Branch, BranchCondition, BranchType } from '../../entities'
import { AvailableBranch } from '../../interfaces'
import {
    BaseQueryPaginateFormat,
    BranchAvailableFormat,
    SupportArea,
    FormatBranchTypeCondition,
    FormatBranchType,
    FindBranchOption,
    FormatFindOneBranch,
    DefaultStatus,
} from '../../interfaces'
import { BranchAvailableDto } from '../../models'
import { OldSystemService } from '../../services'
import { Log } from 'src/logs'
import { verifyLatlng } from '../../../common'

@Injectable()
export class BranchService {
    constructor(
        @InjectRepository(Branch)
        private repo: Repository<Branch>,
        @InjectRepository(BranchCondition)
        private branchConditionRepo: Repository<BranchCondition>,
        @Inject('OldSystemService')
        private oldSystemService: OldSystemService,
        private log: Log,
    ) {}

    private createBrnachBuilder(alias = 'b'): SelectQueryBuilder<Branch> {
        return this.repo.createQueryBuilder(alias)
    }

    public async findBranchAvailables(
        condition: BranchAvailableDto,
    ): Promise<BaseQueryPaginateFormat<BranchAvailableFormat[]>> {
        let query = this.branchConditionRepo.createQueryBuilder('bc')
        const startPagination = (condition.page - 1) * condition.size

        let branches: { id: number; name: string; address: string }[] = []
        let total = 0

        if (condition.locationType == AvailableBranch.From) {
            query = query
                .leftJoinAndSelect(Branch, 'b', 'bc.branch_id_from = b.branch_id')
                .where('b.active = :acitve AND b.branch_type_id != :branchTypeId', { acitve: 1, branchTypeId: 3 })

            const { count } = await query.select('COUNT(DISTINCT(b.branch_id))', 'count').getRawOne()
            total = count
        } else if (condition.locationType == AvailableBranch.To) {
            query = query
                .leftJoinAndSelect(Branch, 'b', 'bc.branch_id_to = b.branch_id')
                .where('b.active = :acitve AND b.branch_type_id != :branchTypeId', { acitve: 1, branchTypeId: 3 })

            const { count } = await query.select('COUNT(DISTINCT(b.branch_id))', 'count').getRawOne()
            total = count
        }

        if (total === 0) return

        branches = await query
            .select(['b.branch_id AS id', 'b.branch_name AS name', 'b.branch_location AS address'])
            .orderBy('id', 'ASC')
            .distinct(true)
            .offset(startPagination)
            .limit(condition.size)
            .getRawMany<{ id: number; name: string; address: string }>()

        return {
            page: condition.page,
            size: condition.size,
            total: total,
            data: branches,
        }
    }

    public async findOneBranchIdOldSystem(latlng: string, placeId?: string): Promise<number> {
        let result: number = null
        const group = verifyLatlng(latlng)

        if (group != null) {
            const fromLat = group[1]
            const fromLng = group[3]
            const query: SupportArea = {
                lat: fromLat,
                lng: fromLng,
            }

            if (placeId != null) {
                query.placeId = placeId
            }

            const fromBranchId = await this.oldSystemService.findSupportArea(query)

            if (fromBranchId != null && fromBranchId.status) {
                result = fromBranchId?.data[0]
            }

            result = -2
        } else {
            result = -1
        }

        return result
    }

    public async findOneBranchOldSystem(latlng: string, placeId?: string): Promise<FormatFindOneBranch<any>> {
        const result: FormatFindOneBranch<any[]> = {
            status: DefaultStatus.FAIL,
            data: null,
        }

        const group = verifyLatlng(latlng)

        if (group != null) {
            const fromLat = group[1]
            const fromLng = group[3]
            const query: SupportArea = {
                lat: fromLat,
                lng: fromLng,
            }

            if (placeId != null) {
                query.placeId = placeId
            }

            const fromBranchId = await this.oldSystemService.findSupportArea(query)

            if (fromBranchId == null) {
                result.status = DefaultStatus.UNKNOWNERROR
                return result
            }

            if (fromBranchId != null && fromBranchId.status) {
                result.status = DefaultStatus.SUCCESS
                result.data = fromBranchId?.data
                return result
            }

            result.status = DefaultStatus.BRANCH_NOTFOUND
        }

        return result
    }

    // public async findOneBranchIdOldSystem(latlng: string, placeId?: string): Promise<number> {
    //     let result: number = null
    //     const latLngReg = /@([0-9]*(\.[0-9]*)?)\,([0-9]*(\.[0-9]*)?)(([0-9]*(\.[0-9]*)?))?/
    //     const isLatlng = latLngReg.test(latlng)

    //     if (isLatlng) {
    //         let fromLat = latlng.split(',')[0]
    //         fromLat = fromLat.split('@')[1]
    //         const fromLng = latlng.split(',')[1]
    //         const query: SupportArea = {
    //             lat: fromLat,
    //             lng: fromLng,
    //         }

    //         if (placeId != null) {
    //             query.placeId = placeId
    //         }

    //         const fromBranchId = await this.oldSystemService.findSupportArea(query)

    //         if (fromBranchId != null && fromBranchId.status && !entity) {
    //             result = fromBranchId?.data[0]
    //         } else if (fromBranchId != null && fromBranchId.status && entity) {
    //             result = fromBranchId?.data
    //         }

    //         result = -2
    //     } else {
    //         result = -1
    //     }

    //     return result
    // }

    public async findOneBranchType(branchId: number): Promise<FormatBranchType> {
        return this.createBrnachBuilder('b')
            .leftJoinAndSelect(BranchType, 'bt', 'bt.branch_type_id = b.branch_type_id')
            .where('b.branch_id =:branchId', { branchId })
            .select([
                'b.branch_id AS id',
                'b.branch_type_id AS branchTypeId',
                'b.branch_name AS branchName',
                'bt.name AS branchTypeName',
                'b.active AS active',
            ])
            .getRawOne<FormatBranchType>()
    }

    public async findOneBranch(branchId: number): Promise<FormatFindOneBranch<Branch>> {
        const result: FormatFindOneBranch<Branch> = {
            status: DefaultStatus.FAIL,
            data: null,
        }

        const branch = await this.repo.findOne({ where: { branch_id: branchId } })

        if (branch == null) {
            result.status = DefaultStatus.BRANCH_NOTFOUND
            return result
        }

        if (branch.active == 0) {
            result.status = DefaultStatus.BRANCH_INACTIVE
            return result
        }

        result.status = DefaultStatus.SUCCESS
        result.data = branch
        return result
    }

    public async findOneBranchTypeCondition(
        branchIdFrom: number,
        branchIdTo: number,
    ): Promise<FormatBranchTypeCondition> {
        const branchCondition = await this.branchConditionRepo
            .createQueryBuilder('bc')
            .leftJoinAndSelect(Branch, 'bFrom', 'bFrom.branch_id = bc.branch_id_from')
            .leftJoinAndSelect(Branch, 'bTo', 'bTo.branch_id = bc.branch_id_to')
            .leftJoinAndSelect(BranchType, 'btFrom', 'btFrom.branch_type_id = bFrom.branch_type_id')
            .leftJoinAndSelect(BranchType, 'btTo', 'btTo.branch_type_id = bTo.branch_type_id')

            .where('bc.branch_id_from = :branchIdFrom AND bc.branch_id_to = :branchIdTo', { branchIdFrom, branchIdTo })
            .select([
                'bc.branch_condition_id AS branchConditionId',
                'bc.branch_id_from AS fromBranchId',
                'bc.branch_id_to AS toBranchId',
                'bFrom.branch_name AS fromBranchName',
                'bTo.branch_name AS toBranchName',
                'btFrom.name AS fromBranchTypeName',
                'btTo.name AS toBranchTypeName',
            ])
            .getRawOne<FormatBranchTypeCondition>()

        if (branchCondition == null) return

        if (branchCondition.fromBranchTypeName == 'AREA') {
            branchCondition.fromBranchTypeName = 'HOTEL'
        }

        if (branchCondition.toBranchTypeName == 'AREA') {
            branchCondition.toBranchTypeName = 'HOTEL'
        }

        return branchCondition
    }

    public async findOneBranchCustom(option: FindBranchOption): Promise<FormatFindOneBranch<FormatBranchType>> {
        const result: FormatFindOneBranch<FormatBranchType> = {
            status: DefaultStatus.FAIL,
            data: null,
        }
        let branch: any = null
        let branchSupportArea: FormatFindOneBranch<any[]> = null

        if (option.branchId) {
            branch = await this.findOneBranchType(option.branchId)

            if (branch == null) {
                result.status = DefaultStatus.BRANCH_NOTFOUND
                return result
            } else if (branch.active == 0) {
                result.status = DefaultStatus.BRANCH_INACTIVE
                return result
            } else {
                result.status = DefaultStatus.SUCCESS
                result.data = branch
            }
        } else if (option.lat != null && option.lng != null) {
            this.log.customDebugLog(`option.lat != null && option.lng != null`)
            const formatLatLng = `@${option.lat},${option.lng}`
            branchSupportArea = await this.findOneBranchOldSystem(formatLatLng, option.placeId)

            if (branchSupportArea.status == null) {
                result.status = DefaultStatus.UNKNOWNERROR
                return result
            } else if (branchSupportArea.status != DefaultStatus.SUCCESS) {
                result.status = branchSupportArea.status
                return result
            }

            branch = await this.findOneBranchType(branchSupportArea.data[0])

            if (branch.active == 0) {
                result.status = DefaultStatus.BRANCH_INACTIVE
                return result
            } else {
                result.status = DefaultStatus.SUCCESS
                result.data = branch
                result.data.branchIdSupport = branchSupportArea.data[2]
                result.data.area = branchSupportArea.data[3]
            }
        } else if (option.latlng != null) {
            this.log.customDebugLog(`option.latlng != null`)
            branchSupportArea = await this.findOneBranchOldSystem(option.latlng, option.placeId)

            if (branchSupportArea.status == null) {
                result.status = DefaultStatus.UNKNOWNERROR
                return result
            } else if (branchSupportArea.status != DefaultStatus.SUCCESS) {
                result.status = branchSupportArea.status
                return result
            }

            branch = await this.findOneBranchType(branchSupportArea?.data[0])

            if (branch == null) {
                result.status = DefaultStatus.BRANCH_NOTFOUND
                return result
            }

            if (branch.active == 0) {
                result.status = DefaultStatus.BRANCH_INACTIVE
                return result
            } else {
                result.status = DefaultStatus.SUCCESS
                result.data = branch
                result.data.branchIdSupport = branchSupportArea[2]
                result.data.area = branchSupportArea.data[3]
            }
        }

        return result
    }
}
