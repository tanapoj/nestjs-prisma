import { Controller } from '@nestjs/common'

@Controller('users')
export class UserController {
    // constructor(
    //     @Inject('UserService')
    //     private readonly userService: UserService,
    //     @Inject('DbClient') protected readonly dbClient: DbClient,
    //     @Inject('TransactionManager')
    //     private readonly tx: TransactionManager,
    // ) {}
    // @Get('all')
    // // @UseGuards(AgentGuard)
    // public async getUsers(@Query() query: PaginationDto, @Response() res: Res): Promise<Res> {
    //     const { data, page, size, total } = await this.tx.run(async (tx: TransactionManager) => {
    //         return this.userService.users(
    //             {
    //                 skip: query.page,
    //                 take: query.size,
    //             },
    //             tx,
    //         )
    //     })
    //     if (data.length === 0) return responseFail(res, { status: HttpStatus.NOT_FOUND })
    //     return responseSuccess(
    //         res,
    //         { users: data },
    //         {
    //             status: HttpStatus.OK,
    //             pagination: { page, size, total },
    //         },
    //     )
    // }
    // // TODO: Remove this test endpoint (this endpoint using for testing AgentGuard)
    // @UseGuards(AgentGuard)
    // @Get('/:id')
    // public async getUserById(@Response() res: Res, @Param('id') id: number): Promise<Res> {
    //     const user = await this.tx.run(async (tx: TransactionManager) => {
    //         return this.userService.user({ id }, tx)
    //     })
    //     if (user == null) {
    //         return responseFail(res, { status: HttpStatus.NOT_FOUND })
    //     }
    //     return responseSuccess(res, { user: user }, { status: HttpStatus.OK })
    // }
    // @Get('user/:id')
    // public async getUser(@Response() res: Res, @Param('id') id: string): Promise<Res> {
    //     const user = await this.tx.run(async (tx: TransactionManager) => {
    //         return this.userService.user({ id: Number(id) }, tx)
    //     })
    //     if (user == null) return responseFail(res, { status: HttpStatus.NOT_FOUND })
    //     return responseSuccess(res, { user: user }, { status: HttpStatus.OK })
    // }
}
