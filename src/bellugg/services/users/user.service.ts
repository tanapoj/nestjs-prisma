import { Injectable } from '@nestjs/common'

@Injectable()
export class UserService {}

// @Injectable()
// export class UserService extends BaseService<User> {
//     constructor(
//         @Inject('Repository')
//         protected repo: Repository,
//     ) {
//         super(repo)
//     }

//     get tableName(): string {
//         return 'user'
//     }

// public async getAuthAgentByUsername(username: string): Promise<AuthAgent> {
//     // @ts-ignore
//     return this.repo.db.authAgent.findFirst({
//         where: {
//             username,
//         },
//     })
// }

//     public async user(userWhereUniqueInput: Prisma.UserWhereUniqueInput, tx: TransactionManager): Promise<User> {
//         const user = await tx.db.user.findUnique({
//             where: userWhereUniqueInput,
//         })

//         if (user == null) return

//         return user
//     }

//     public async users(
//         params: {
//             skip?: number
//             take?: number
//             cursor?: Prisma.UserWhereUniqueInput
//             where?: Prisma.UserWhereInput
//             orderBy?: Prisma.UserOrderByWithRelationInput
//         },
//         tx: TransactionManager,
//     ): Promise<BaseQueryPaginateFormat<User[]>> {
//         const { skip, take, cursor, where, orderBy } = params
//         const startPagination = (skip - 1) * take
//         const endPagination = skip * take

//         const result: BaseQueryPaginateFormat<User[]> = {
//             total: 0,
//             data: [],
//             page: skip,
//             size: take,
//         }

//         const total = await tx.db.user.count({ where })

//         if (total === 0) return result

//         const user = await this.db.user.findMany({
//             skip: startPagination,
//             take: endPagination,
//             cursor,
//             where,
//             orderBy,
//         })

//         return {
//             ...result,
//             data: user,
//             total,
//         }
//     }
// }
