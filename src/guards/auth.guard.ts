import { CanActivate, ExecutionContext, HttpStatus, Inject, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { IncomingMessage } from 'http'
import { AuthService } from '../nestpris'
import { responseError } from '../common'
import { Response as Res } from 'express'

@Injectable()
export class AgentGuard implements CanActivate {
    constructor(
        @Inject('AuthService')
        private authService: AuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = this.getRequest<IncomingMessage & { user?: Record<string, unknown> }>(context)
        const response = context.switchToHttp().getResponse<Res>()
        try {
            const authorization = request.headers['authorization']

            if (authorization == null) {
                responseError(response, HttpStatus.UNAUTHORIZED)
            }

            return await this.authAgent(response, authorization)
        } catch (e) {
            return false
        }
    }

    protected getRequest<T>(context: ExecutionContext): T {
        return context.switchToHttp().getRequest()
    }

    protected async authAgent(res: Res, accessToken: string): Promise<boolean> {
        const tokenBase64 = accessToken.split(' ').pop()
        const decodedToken = Buffer.from(tokenBase64, 'base64').toString('utf8')

        const decodeTokenArray = decodedToken.split(':')
        const username = decodeTokenArray[0]
        const decodedSecretTokenFromHeader = decodeTokenArray[1]

        // query auth_agent from db
        const { secret } = await this.authService.getAuthAgentByUsername(username)

        if (secret == null) {
            responseError(res, HttpStatus.UNAUTHORIZED)
        }

        return await this.verifySecret(secret, decodedSecretTokenFromHeader)
    }

    async verifySecret(hash: string, plaintextSecret: string): Promise<boolean> {
        return await bcrypt.compare(plaintextSecret, hash)
    }
}
