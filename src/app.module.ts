import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BelluggModule, DbClient } from './bellugg'
import { ConfigModule } from './config'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { CustomInterceptor } from './interceptors/custom.interceptor'
import { TypeOrmModule } from '@nestjs/typeorm'
import { configService } from 'src/config'
import {
    Order,
    BranchCondition,
    Branch,
    BranchType,
    Coordinates,
    Luggage,
    ImageOrder,
    Agent,
    Size,
} from './bellugg/entities'

@Module({
    imports: [
        TypeOrmModule.forRoot({
            ...configService.dbConfig,
            entities: [Order, BranchCondition, Branch, BranchType, Coordinates, Luggage, ImageOrder, Agent, Size],
        }),
        BelluggModule,
        ConfigModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: CustomInterceptor,
        },
        DbClient,
    ],
})
export class AppModule {}
