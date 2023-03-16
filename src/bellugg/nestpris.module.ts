import { Module, Provider } from '@nestjs/common'
import {
    UserService,
    ServiceTypeService,
    BookingsService,
    ImageOrderService,
    LuggageService,
    OldSystemService,
    BranchService,
    TimeSlotService,
    AgentService,
    AuthService,
    AreaService,
} from './services'
import {
    UserController,
    ServiceTypeController,
    BookingsController,
    BranchController,
    TimeSlotController,
    LuggageController,
    AreaController,
} from './controllers'
import { Repository, DbClient, TransactionManager } from './repositories'
import { ConfigModule } from '../config'
import { RepositoriesModule } from './repositories/repositories.module'
import { Log } from '../logs'
import { Order, BranchCondition, Branch, BranchType, Coordinates, Luggage, ImageOrder, Agent, Size } from './entities'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HttpModule } from '@nestjs/axios'

const AreaServiceProvider: Provider = {
    provide: 'AreaService',
    useClass: AreaService,
}

const AuthServiceProvider: Provider = {
    provide: 'AuthService',
    useClass: AuthService,
}

const AgentServiceProvider: Provider = {
    provide: 'AgentService',
    useClass: AgentService,
}

const UserServiceProvider: Provider = {
    provide: 'UserService',
    useClass: UserService,
}

const BranchServiceProvider: Provider = {
    provide: 'BranchService',
    useClass: BranchService,
}

const ServiceTypeServiceProvider: Provider = {
    provide: 'ServiceTypeService',
    useClass: ServiceTypeService,
}

const OldSystemServiceProvider: Provider = {
    provide: 'OldSystemService',
    useClass: OldSystemService,
}

const LuggageServiceProvider: Provider = {
    provide: 'LuggageService',
    useClass: LuggageService,
}

const BookingsServiceProvider: Provider = {
    provide: 'BookingsService',
    useClass: BookingsService,
}

const ImageOrderServiceProvider: Provider = {
    provide: 'ImageOrderService',
    useClass: ImageOrderService,
}

const RepositoryProvider: Provider = {
    provide: 'Repository',
    useClass: Repository,
}

const TransactionManagerProvider: Provider = {
    provide: 'TransactionManager',
    useClass: TransactionManager,
}

const DbClientProvider: Provider = {
    provide: 'DbClient',
    useClass: DbClient,
}

const TimeSlotServiceProvider: Provider = {
    provide: 'TimeSlotService',
    useClass: TimeSlotService,
}

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Order,
            BranchCondition,
            Branch,
            BranchType,
            Coordinates,
            Luggage,
            ImageOrder,
            Agent,
            Size,
        ]),
        ConfigModule,
        RepositoriesModule,
        HttpModule,
    ],
    controllers: [
        UserController,
        BookingsController,
        BranchController,
        ServiceTypeController,
        TimeSlotController,
        LuggageController,
        AreaController,
    ],

    providers: [
        RepositoryProvider,
        UserServiceProvider,
        DbClientProvider,
        Log,
        BookingsServiceProvider,
        TransactionManagerProvider,
        ImageOrderServiceProvider,
        LuggageServiceProvider,
        OldSystemServiceProvider,
        TimeSlotServiceProvider,
        BranchServiceProvider,
        ServiceTypeServiceProvider,
        AgentServiceProvider,
        AuthServiceProvider,
        AreaServiceProvider,
    ],
    exports: [
        RepositoryProvider,
        UserServiceProvider,
        DbClientProvider,
        Log,
        BookingsServiceProvider,
        TransactionManagerProvider,
        ImageOrderServiceProvider,
        LuggageServiceProvider,
        OldSystemServiceProvider,
        TimeSlotServiceProvider,
        BranchServiceProvider,
        ServiceTypeServiceProvider,
        AgentServiceProvider,
        AuthServiceProvider,
        AreaServiceProvider,
    ],
})
export class NestPrisModule {}
