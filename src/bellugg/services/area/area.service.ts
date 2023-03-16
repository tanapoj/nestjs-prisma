import { Inject, Injectable } from '@nestjs/common'
import { OldSystemService, BranchService } from '../../services'
import { AreaDto } from '../../models'
import { VerifyAreaFormat, FormatResultService, DefaultStatus } from '../../interfaces'
import { getBranchTransformType, BranchTransform, BranchTransformInterface, mappingLatlng } from '../../../common'

@Injectable()
export class AreaService {
    constructor(
        @Inject('OldSystemService') private oldSystemService: OldSystemService,
        @Inject('BranchService') private branchService: BranchService,
    ) {}

    public async verifyArea(dto: AreaDto): Promise<FormatResultService<VerifyAreaFormat>> {
        let result: FormatResultService<VerifyAreaFormat> = {
            status: DefaultStatus.SUCCESS,
            data: {
                from: null,
                to: null,
            },
        }

        const fromLagLng = mappingLatlng(dto.from.lat, dto.from.lng)
        const toLagLng = mappingLatlng(dto.to.lat, dto.to.lng)
        const formatBranchTransform: BranchTransformInterface = {
            from: {
                branchId: dto.from.id,
                latLng: fromLagLng,
            },
            to: {
                branchId: dto.to.id,
                latLng: toLagLng,
            },
        }

        const branchTransform = getBranchTransformType<BranchTransformInterface>(formatBranchTransform)

        if (branchTransform == BranchTransform.FAIL) {
            return
        }

        if (branchTransform == BranchTransform.BRANCHID_TO_BRANCHID) {
            const fromBranch = await this.branchService.findOneBranch(dto.from.id)
            const toBranch = await this.branchService.findOneBranch(dto.to.id)

            if (fromBranch.status != DefaultStatus.SUCCESS) {
                result.status = fromBranch.status
                return result
            }

            if (toBranch.status != DefaultStatus.SUCCESS) {
                result.status = fromBranch.status
                return result
            }

            result.data.from = {
                type: dto.from.type,
                id: dto.from.id,
            }

            result.data.to = {
                type: dto.to.type,
                id: dto.to.id,
            }
        } else if (branchTransform == BranchTransform.BRANCHID_TO_LATLNG) {
            const fromBranch = await this.branchService.findOneBranch(dto.from.id)
            const toBranch = await this.branchService.findOneBranchCustom({
                lat: dto.to.lat,
                lng: dto.to.lng,
                placeId: dto.to.placeId,
            })

            if (fromBranch.status != DefaultStatus.SUCCESS) {
                result.status = fromBranch.status
                return result
            }

            if (toBranch.status != DefaultStatus.SUCCESS) {
                result.status = toBranch.status
                return result
            }

            result.data.from = {
                type: dto.from.type,
                id: dto.from.id,
            }

            result.data.to = {
                type: dto.to.type,
                lat: dto.to.lat,
                lng: dto.to.lng,
                placeId: dto.to.placeId,
            }
        } else if (branchTransform == BranchTransform.LATLNG_TO_BRANCHID) {
            const fromBranch = await this.branchService.findOneBranchCustom({
                lat: dto.from.lat,
                lng: dto.from.lng,
                placeId: dto.from.placeId,
            })
            const toBranch = await this.branchService.findOneBranch(dto.to.id)

            if (fromBranch.status != DefaultStatus.SUCCESS) {
                result.status = fromBranch.status
                return result
            }
            if (toBranch.status != DefaultStatus.SUCCESS) {
                result.status = toBranch.status
                return result
            }

            result.data.from = {
                type: dto.to.type,
                id: dto.to.id,
            }

            result.data.to = {
                type: dto.from.type,
                lat: dto.from.lat,
                lng: dto.from.lng,
                placeId: dto.from.placeId,
            }
        } else if (branchTransform == BranchTransform.LATLNG_TO_LATLNG) {
            const fromBranch = await this.branchService.findOneBranchCustom({
                lat: dto.from.lat,
                lng: dto.from.lng,
                placeId: dto.from.placeId,
            })
            const toBranch = await this.branchService.findOneBranchCustom({
                lat: dto.to.lat,
                lng: dto.to.lng,
                placeId: dto.to.placeId,
            })

            if (fromBranch != null && fromBranch.status != DefaultStatus.SUCCESS) {
                result.status = fromBranch.status
                return result
            }

            if (toBranch != null && toBranch.status != DefaultStatus.SUCCESS) {
                result.status = toBranch.status
                return result
            }

            result.data.to = {
                type: dto.from.type,
                lat: dto.from.lat,
                lng: dto.from.lng,
                placeId: dto.from.placeId,
            }

            result.data.to = {
                type: dto.to.type,
                lat: dto.to.lat,
                lng: dto.to.lng,
                placeId: dto.to.placeId,
            }
        }

        return result
    }
}
