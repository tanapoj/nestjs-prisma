import { Controller, Get, Inject, Query, UseGuards, Response, HttpStatus, Body } from '@nestjs/common'
import { LuggageService } from '../../services'
import { Response as Res } from 'express'
import { responseSuccess, responseFail } from '../../../common/helper'
import { AgentGuard } from '../../../guards/auth.guard'
import { LuggageSize } from '../../interfaces'
import { LuggageSizeDto } from '../../models'
import { getBranchTransformType, BranchTransform } from '../../../common'

@Controller()
export class LuggageController {
    constructor(@Inject('LuggageService') private luggageService: LuggageService) {}

    @UseGuards(AgentGuard)
    @Get('/agent/me/delivery/luggages')
    async getLuggageSize(@Response() res: Res, @Body() dto: LuggageSizeDto) {
        let result: LuggageSize[] = null
        const branchTransform = getBranchTransformType<LuggageSizeDto>(dto)

        if (branchTransform == BranchTransform.FAIL) {
            return responseFail(res, {
                status: HttpStatus.BAD_REQUEST,
                message: 'parameter-verification-failed',
                code: 'parameter verification failed',
            })
        }

        if (branchTransform == BranchTransform.BRANCHID_TO_BRANCHID) {
            result = await this.luggageService.findOneLuggageSize(78, dto.from.branchId, dto.to.branchId)
        } else if (branchTransform == BranchTransform.BRANCHID_TO_LATLNG) {
            const toBranchId = await this.luggageService.getBranchIdAvaiable(dto.to.latLng, dto.to.placeId)
            result = await this.luggageService.findOneLuggageSize(78, dto.from.branchId, toBranchId)
        } else if (branchTransform == BranchTransform.LATLNG_TO_BRANCHID) {
            const fromBranchId = await this.luggageService.getBranchIdAvaiable(dto.from.latLng, dto.from.placeId)
            result = await this.luggageService.findOneLuggageSize(78, fromBranchId, dto.to.branchId)
        } else if (branchTransform == BranchTransform.LATLNG_TO_LATLNG) {
            const fromBranchId = await this.luggageService.getBranchIdAvaiable(dto.from.latLng, dto.from.placeId)
            const toBranchId = await this.luggageService.getBranchIdAvaiable(dto.to.latLng, dto.to.placeId)
            result = await this.luggageService.findOneLuggageSize(78, fromBranchId, toBranchId)
        }

        if (result == null) {
            return responseFail(res, {
                status: HttpStatus.NOT_FOUND,
                message: 'Luggage size not found.',
                code: 'not-found-luggage-size',
            })
        }

        return responseSuccess(res, { luggages: result })
    }
}
