import { Inject, Injectable } from '@nestjs/common'
import { DbClient } from './db-client'
import { PrismaClient, Prisma } from '@prisma/client'
@Injectable()
export class Repository {
    constructor(@Inject('DbClient') protected dbClient: DbClient) {}

    get db(): PrismaClient | Prisma.TransactionClient {
        return currentTx ?? this.dbClient
    }
}

let currentTx: Prisma.TransactionClient = null
export async function runInTranasction<R>(
    client: PrismaClient,
    fn: (tx: Prisma.TransactionClient) => Promise<R>,
    options?: { maxWait?: number; timeout?: number; isolationLevel?: Prisma.TransactionIsolationLevel },
): Promise<R> {
    if (currentTx != null) {
        return fn(currentTx)
    }

    const result = await client.$transaction(
        async transaction => {
            currentTx = transaction
            const result = await fn(currentTx)
            currentTx = null
            return result
        },
        { ...options },
    )

    return result
}
