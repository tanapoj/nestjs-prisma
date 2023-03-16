import * as typeorm from 'typeorm'

export interface EnvConfig {
    APP_ENV: string
    API_PORT: number
    DB_MSSQL_TYPE: typeorm.DatabaseType
    DB_MSSQL_HOST: string
    DB_MSSQL_USERNAME: string
    DB_MSSQL_PASSWORD: string
    DB_MSSQL_PORT: number
    DB_MSSQL_DATABASE: string
    OLD_SYSTEM_URL: string
    LIMIT_JSON_SIZE: string
    LIMIT_IMG_SIZE_IN_MB: number
}
