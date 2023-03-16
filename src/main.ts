import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from './config'
import { DbClient } from './nestpris'
import { ResponseInterceptor } from './nestpris/interceptors'
import { Log } from './logs/log.service'
import * as bodyParser from 'body-parser'

declare const module: any

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: new Log(),
    })
    //app.useGlobalGuards(new AgentGuard())

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    )

    app.enableCors()

    const prismaService: DbClient = app.get(DbClient, { strict: false })
    await prismaService.enableShutdownHooks(app)

    // app.enableShutdownHooks();
    app.useGlobalInterceptors(new ResponseInterceptor())

    app.enableCors()
    const configService: ConfigService = app.get('ConfigService')

    app.use(bodyParser.json({ limit: configService.limitJsonSize }))
    // app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

    const port = configService.apiPort
    await app.listen(port, () => {
        Logger.log('Listening at http://localhost:' + port + '/')
    })

    // https://stackoverflow.com/questions/71138325/nest-start-watch-not-reloading-after-changes-nest-start-watch-not-working
    if (module.hot) {
        module.hot.accept()
        module.hot.dispose(() => app.close())
    }
}

bootstrap()
