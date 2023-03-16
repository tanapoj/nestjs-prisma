import { Inject, Injectable, Request } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Agent } from '../../entities'
import { Request as Req } from 'express'
import { AuthService } from '../../services'

@Injectable()
export class AgentService {
    constructor(
        @InjectRepository(Agent)
        private repo: Repository<Agent>,
        @Inject('AuthService')
        protected authService: AuthService,
    ) {}

    public async findOneByAgentName(agentName: string): Promise<Agent> {
        return this.repo.findOne({ where: { agent_name: agentName } })
    }

    public async getAgentByToken(@Request() req: Req): Promise<Agent> {
        const authorization = req.headers['authorization']
        const token = await this.authService.authAgent(authorization)
        return this.findOneByAgentName(token)
    }
}
