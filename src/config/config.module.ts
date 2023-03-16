import { Module, Provider } from '@nestjs/common'
import { ConfigService } from '../config'

const { NODE_ENV } = process.env

export const configService = new ConfigService(`.env.${NODE_ENV != null ? NODE_ENV : 'development'}`)

const ConfigServiceProvider: Provider = {
    provide: 'ConfigService',
    useValue: configService,
}

@Module({
    providers: [ConfigServiceProvider],
    exports: [ConfigServiceProvider],
})
export class ConfigModule {}
