import { Inject, Injectable, Scope } from '@nestjs/common'
import { DbClient } from './db-client'
import { PrismaClient, Prisma } from '@prisma/client'
import { Log } from '../../logs'

@Injectable({ scope: Scope.REQUEST })
export class TransactionManager {
    private currentTx: PrismaClient | Prisma.TransactionClient
    constructor(@Inject('DbClient') protected dbClient: DbClient, private log: Log) {
        this.log.customDebugLog(`Repository = ${new Date().toISOString()} , tx=${this.currentTx}`)
    }

    get db(): PrismaClient | Prisma.TransactionClient {
        return this.currentTx ?? this.dbClient
    }

    public async run<R>(
        fn: (tx: TransactionManager) => Promise<R>,
        options?: { maxWait?: number; timeout?: number; isolationLevel?: Prisma.TransactionIsolationLevel },
    ): Promise<R> {
        if (this.currentTx != null) {
            return fn(this)
        }

        const result = await this.dbClient.$transaction(
            async transaction => {
                this.currentTx = transaction
                const result = await fn(this)
                this.currentTx = null
                return result
            },
            { ...options },
        )

        return result
    }
}
