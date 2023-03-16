import { Injectable, NotFoundException } from '@nestjs/common'
import { AgentType, AgentTypeProps } from '../../entities'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DeleteResult } from 'typeorm'

@Injectable()
export class AgentTypeService {
    constructor(
        @InjectRepository(AgentType)
        private agentTypeRepository: Repository<AgentType>,
    ) {}

    async getAgentTypeSample(): Promise<AgentType[]> {
        return this.agentTypeRepository.find()
    }

    async createAgentType(agentType: AgentTypeProps): Promise<AgentType> {
        const props = this.agentTypeRepository.create(agentType)

        return this.agentTypeRepository.save(props)
    }

    async updateAgentType(agentType: AgentTypeProps): Promise<AgentType> {
        const getAgentType = await this.agentTypeRepository.findOne({
            where: {
                type: agentType.type,
                pay_out: agentType.pay_out,
            },
        })

        if (getAgentType == null) throw new NotFoundException()

        const props = this.agentTypeRepository.create({
            ...getAgentType,
            ...agentType,
        })

        return this.agentTypeRepository.save(props)
    }

    async deleteAgentType(agentType: AgentTypeProps): Promise<DeleteResult> {
        const getAgentType = await this.agentTypeRepository.findOne({
            where: {
                type: agentType.type,
                pay_out: agentType.pay_out,
            },
        })

        if (getAgentType == null) throw new NotFoundException()

        return this.agentTypeRepository.delete(getAgentType.id)
    }
}
