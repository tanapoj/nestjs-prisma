import { ConsoleLogger } from '@nestjs/common'

const { APP_ENV } = process.env

export class Log extends ConsoleLogger {
    private enableLog = false

    constructor() {
        super()

        if (APP_ENV === 'development') {
            this.enableLog = true
        }
    }

    customDebugLog(message: any) {
        try {
            if (!this.enableLog) return

            return this.debug(message)
        } catch (error) {
            console.log('customDebugLogCatch', error)
        }
    }

    customDebugContextLog(message: any, context?: string) {
        try {
            if (!this.enableLog) return

            return this.debug(message, context)
        } catch (error) {
            console.log('customDebugLogCatch', error)
        }
    }

    customErrorLog(message: string, stack?: string, context?: string) {
        try {
            if (!this.enableLog) return

            return this.error(message, stack, context)
        } catch (error) {
            console.log('customErrorLogCatch', error)
        }
    }
}
