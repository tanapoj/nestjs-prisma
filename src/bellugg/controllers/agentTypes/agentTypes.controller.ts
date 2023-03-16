import { Controller, Get, Post, Body, Put, Delete, Inject } from '@nestjs/common'
import { AgentTypeService } from '../../services'
import { AgentType, AgentTypeProps } from '../../entities'
import { DeleteResult } from 'typeorm'

@Controller('agentType')
export class AgentTypeController {
    constructor(
        @Inject('AgentTypeService')
        private readonly agentTypeService: AgentTypeService,
    ) {}

    @Get()
    async getAgentTypeSample(): Promise<AgentType[]> {
        return this.agentTypeService.getAgentTypeSample()
    }

    @Post()
    async createAgentType(@Body() props: AgentTypeProps): Promise<AgentType> {
        return this.agentTypeService.createAgentType(props)
    }

    @Put()
    async updateAgentType(@Body() props: AgentTypeProps): Promise<AgentType> {
        return this.agentTypeService.updateAgentType(props)
    }

    @Delete()
    async deleteAgentType(@Body() props: AgentTypeProps): Promise<DeleteResult> {
        return this.agentTypeService.deleteAgentType(props)
    }
}
