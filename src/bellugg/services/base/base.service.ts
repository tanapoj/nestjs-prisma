import { Inject } from '@nestjs/common'
import { Repository } from 'src/bellugg/repositories'
import { PrismaClient, Prisma } from '@prisma/client'
import { TransactionManager } from '../../repositories'

export abstract class BaseService<T> {
    constructor(
        @Inject('Repository')
        protected repo: Repository,
    ) {}

    abstract get tableName(): string

    get db(): PrismaClient | Prisma.TransactionClient {
        return this.repo.db
    }

    protected async find(id: number, tx: TransactionManager): Promise<T> {
        const user = await tx.db[this.tableName].findUnique({
            where: {
                id,
            },
        })

        if (user == null) return

        return user
    }
}
