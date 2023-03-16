import {CallHandler, ExecutionContext, NestInterceptor} from "@nestjs/common"
import {map, Observable} from "rxjs"

export class CustomInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, handler: CallHandler): Observable<any> | Promise<Observable<any>> {
        return handler.handle().pipe(
            map((data) => {
                return data
            })
        )
    }
}