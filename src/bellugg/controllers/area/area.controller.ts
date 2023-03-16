import { Controller, Post, Body, Inject, Response, HttpStatus } from '@nestjs/common'
import { AreaDto } from '../../models'
import { AreaService } from 'src/nestpris/services'
import { responseSuccess, responseFail } from '../../../common/helper'
import { Response as Res } from 'express'

@Controller()
export class AreaController {
    constructor(@Inject('AreaService') private areaService: AreaService) {}

    @Post('agent/me/supportAreas/verify')
    async verifyArea(@Response() res: Res, @Body() dto: AreaDto) {
        const areaVerify = await this.areaService.verifyArea(dto)

        if (areaVerify == null) {
            return responseFail(res, {
                status: HttpStatus.BAD_REQUEST,
                message: 'parameter-verification-failed',
                code: 'parameter verification failed',
            })
        }

        return responseSuccess(res, { ...areaVerify })
    }
}
