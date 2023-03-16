import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import { Response as Res } from 'express'
import { responseError, responseFail } from '../../common'
import { Log } from '../../logs'

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const response = context.switchToHttp().getResponse<Res>()
        const log = new Log()
        return next.handle().pipe(
            catchError(error => {
                // console.log(error)
                log.customErrorLog(`this is error =${error}`, context.getType())

                if (error?.response != null) {
                    const { statusCode, message } = error.response

                    if (message != null && Array(message)?.length > 0) {
                        return throwError(() =>
                            responseFail(response, {
                                status: HttpStatus.BAD_REQUEST,
                                message: message[0],
                            }),
                        )
                    }

                    return throwError(() => responseError(response, statusCode))
                }

                return throwError(() => responseError(response, HttpStatus.BAD_GATEWAY))
            }),
            tap(data => {
                return data
            }),
        )
    }
}
