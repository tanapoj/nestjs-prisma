import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class DbClient extends PrismaClient implements OnModuleInit {
    constructor() {
        super({
            log: ['error', 'info', 'query', 'warn'],
        })
    }

    public async onModuleInit() {
        await this.$connect()
    }

    public async enableShutdownHooks(app: INestApplication) {
        this.$on('beforeExit', async () => {
            await app.close()
        })
    }
}
