import { Controller, Get, Inject, Query, UseGuards, Response, HttpStatus } from '@nestjs/common'
import { BranchService } from '../../services'
import { BranchAvailableDto } from '../../models'
import { Response as Res } from 'express'
import { responseSuccess, responseFail } from '../../../common/helper'
import { AgentGuard } from '../../../guards/auth.guard'

@Controller()
export class BranchController {
    constructor(@Inject('BranchService') private branchService: BranchService) {}

    @UseGuards(AgentGuard)
    @Get('/agent/me/branches')
    async findBranchAvailables(@Query() branchAvailable: BranchAvailableDto, @Response() res: Res) {
        const branches = await this.branchService.findBranchAvailables(branchAvailable)

        if (branches == null) {
            return responseFail(res, { status: HttpStatus.NOT_FOUND, message: 'Branches not found.' })
        }

        return responseSuccess(
            res,
            { branches: branches.data },
            { status: HttpStatus.OK, pagination: { page: branches.page, size: branches.size, total: branches.total } },
        )
    }
}
