import { Injectable, Inject } from '@nestjs/common'
import { AuthAgent } from '@prisma/client'
import { BaseService } from '../base'
import { Repository } from 'src/nestpris/repositories'

@Injectable()
export class AuthService extends BaseService<AuthAgent> {
    constructor(
        @Inject('Repository')
        protected repo: Repository,
    ) {
        super(repo)
    }

    get tableName(): string {
        return 'auth_agent'
    }

    public async authAgent(accessToken: string): Promise<string> {
        const tokenBase64 = accessToken.split(' ').pop()
        const decodedToken = Buffer.from(tokenBase64, 'base64').toString('utf8')

        const decodeTokenArray = decodedToken.split(':')
        const username = decodeTokenArray[0]

        return username
    }

    public async getAuthAgentByUsername(username: string): Promise<AuthAgent> {
        // @ts-ignore
        return this.repo.db.authAgent.findFirst({
            where: {
                username,
            },
        })
    }
}
