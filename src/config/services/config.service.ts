import { Injectable, NotImplementedException } from '@nestjs/common'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as Joi from 'joi'
import { EnvConfig } from '../interfaces'
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions'
import { SqlServerConnectionOptions } from 'typeorm/driver/sqlserver/SqlServerConnectionOptions'
import * as typeorm from 'typeorm'

export declare type SupportedDbConnectionOption =
    | MysqlConnectionOptions
    | PostgresConnectionOptions
    | SqliteConnectionOptions
    | SqlServerConnectionOptions

@Injectable()
export class ConfigService {
    private readonly envConfig: EnvConfig
    constructor(filePath: string) {
        try {
            const config = dotenv.parse(fs.readFileSync(filePath))
            this.envConfig = this.validateEnvInput({ ...process.env, ...config })
        } catch (error) {
            throw error
        }
    }

    public get limitJsonSize(): string {
        return this.envConfig.LIMIT_JSON_SIZE
    }

    public get limitImgSizeInMb(): number {
        return this.envConfig.LIMIT_IMG_SIZE_IN_MB
    }

    public get appEnv(): string {
        return this.envConfig.APP_ENV
    }

    public get apiPort(): number {
        return this.envConfig.API_PORT
    }

    get dbType(): typeorm.DatabaseType {
        return this.envConfig.DB_MSSQL_TYPE
    }

    get dbHost(): string {
        return this.envConfig.DB_MSSQL_HOST
    }

    get dbPort(): number {
        return this.envConfig.DB_MSSQL_PORT
    }

    get dbUsername(): string {
        return this.envConfig.DB_MSSQL_USERNAME
    }

    get dbPassword(): string {
        return this.envConfig.DB_MSSQL_PASSWORD
    }

    get dbDatabase(): string {
        return this.envConfig.DB_MSSQL_DATABASE
    }

    get dbConfig(): SqlServerConnectionOptions {
        if (this.dbType === 'mssql') {
            return {
                type: 'mssql',
                host: this.dbHost,
                port: this.dbPort,
                username: this.dbUsername,
                password: this.dbPassword,
                database: this.dbDatabase,
                entities: [],
                extra: { trustServerCertificate: true },
            }
        } else {
            throw new NotImplementedException()
        }
    }

    get oldSystemUrl(): string {
        return this.envConfig.OLD_SYSTEM_URL
    }

    private validateEnvInput(envConfig: Record<string, any>): EnvConfig {
        const envVarsSchema: Joi.ObjectSchema = Joi.object({
            APP_ENV: Joi.string().default('development'),
            API_PORT: Joi.number().default(3000),
            DB_MSSQL_TYPE: Joi.string().valid('mysql', 'postgres', 'sqlite', 'mssql').required(),
            DB_MSSQL_USERNAME: Joi.string().required(),
            DB_MSSQL_PASSWORD: Joi.string().required(),
            DB_MSSQL_HOST: Joi.string().required(),
            DB_MSSQL_PORT: Joi.number().required(),
            DB_MSSQL_DATABASE: Joi.string().required(),
            OLD_SYSTEM_URL: Joi.string().required(),
            LIMIT_JSON_SIZE: Joi.string().default('6mb'),
            LIMIT_IMG_SIZE_IN_MB: Joi.number().default(50),
        })
        const { error, value: validatedEnvConfig } = envVarsSchema.validate(envConfig, { stripUnknown: true })
        if (error) {
            throw new Error(`Config validation error: ${error.message}`)
        }
        return validatedEnvConfig
    }
}
