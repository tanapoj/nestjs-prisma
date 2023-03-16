import { Inject, Injectable } from '@nestjs/common'
import { Request as Req } from 'express'
import { Agent, ServiceTypeFormat } from '../../interfaces'
import { AuthService } from '../../services'

@Injectable()
export class ServiceTypeService {
    constructor(@Inject('AuthService') private authService: AuthService) {}

    public async findServiceType(req: Req): Promise<ServiceTypeFormat[]> {
        const authorization = req.headers['authorization']
        const token = await this.authService.authAgent(authorization)
        let mockResponse: ServiceTypeFormat[] = []

        if (token == Agent.GOODLUGG) {
            mockResponse = [
                {
                    id: 1,
                    name: 'Luggage Delivery',
                    serviceType: 'DELIVERY',
                },
            ]
        }

        return mockResponse
    }
}
