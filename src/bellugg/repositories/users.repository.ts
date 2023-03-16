import { Repository } from './repository'
import { DbClient } from './db-client'
import { Inject } from '@nestjs/common'

export class UsersRepository extends Repository {
    constructor(@Inject('DbClient') protected dbClient: DbClient) {
        super(dbClient)
    }
}
