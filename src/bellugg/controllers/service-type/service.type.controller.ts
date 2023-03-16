import { Controller, Get, Inject, UseGuards, Request, Response } from '@nestjs/common'
import { AgentGuard } from '../../../guards/auth.guard'
import { ServiceTypeService } from '../../services'
import { Request as Req, Response as Res } from 'express'
import { handleResponse } from '../../../common/helper'
import { DefaultStatus } from 'src/nestpris/interfaces'
@Controller()
export class ServiceTypeController {
    constructor(@Inject('ServiceTypeService') private serviceTypeService: ServiceTypeService) {}

    @UseGuards(AgentGuard)
    @Get('agent/me/services')
    async findServiceType(@Request() req: Req, @Response() res: Res) {
        const result = await this.serviceTypeService.findServiceType(req)

        return handleResponse(DefaultStatus.SUCCESS, res, { services: result })
    }
}
