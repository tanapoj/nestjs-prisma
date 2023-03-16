import { Controller, Get, Inject, UseGuards, Request } from '@nestjs/common'
import { AgentGuard } from '../../../guards/auth.guard'
import { OldSystemService } from '../../services'
import { Request as Req } from 'express'

@Controller()
export class OldSyStemController {
    constructor(@Inject('OldSystemService') private oldSystemService: OldSystemService) {}

    // @Get('checkArea')
    // async findServiceType(@Request() req: Req) {
    //     return this.oldSystemService.findSupportArea()
    // }
}
