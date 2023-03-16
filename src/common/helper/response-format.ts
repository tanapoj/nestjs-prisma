import { HttpStatus } from '@nestjs/common'
import { Response as Res } from 'express'
import { Status, ResponseFormatToFail, ResponseFormatToError, Option } from '../../nestpris'
import { DefaultStatus } from '../../nestpris/interfaces'
export interface Options {
    status: HttpStatus
    message?: string
    code?: string
}

export function handleResponse(status: DefaultStatus, res: Res, data?: any, options?: Option) {
    switch (status) {
        case DefaultStatus.SUCCESS:
            responseSuccess(res, data, { status: HttpStatus.OK, ...options })
            break
        case DefaultStatus.BRANCH_CONDITION_NOTFOUND:
            responseFail(res, {
                ...options,
                status: HttpStatus.BAD_REQUEST,
                message: DefaultStatus.BRANCH_CONDITION_NOTFOUND,
            })
            break
        case DefaultStatus.BRANCH_NOTFOUND:
            responseFail(res, { status: HttpStatus.BAD_REQUEST, message: DefaultStatus.BRANCH_NOTFOUND, ...options })
            break
        case DefaultStatus.FAIL:
            responseFail(res, { status: HttpStatus.BAD_REQUEST, message: DefaultStatus.FAIL, ...options })
            break
        case DefaultStatus.BRANCH_INACTIVE:
            responseFail(res, { status: HttpStatus.BAD_REQUEST, message: DefaultStatus.BRANCH_INACTIVE, ...options })
            break
        case DefaultStatus.IMAGETOOLARGE:
            responseFail(res, { status: HttpStatus.BAD_REQUEST, message: DefaultStatus.IMAGETOOLARGE, ...options })
            break
        case DefaultStatus.BOOKING_NOTFOUND:
            responseFail(res, { status: HttpStatus.BAD_REQUEST, message: DefaultStatus.BOOKING_NOTFOUND, ...options })
            break
        case DefaultStatus.UNKNOWNERROR:
            responseFail(res, { status: HttpStatus.BAD_REQUEST, message: DefaultStatus.UNKNOWNERROR, ...options })
            break
        case DefaultStatus.UPDATE_LUGGAGES_FAILED:
            responseFail(res, {
                status: HttpStatus.BAD_REQUEST,
                message: DefaultStatus.UPDATE_LUGGAGES_FAILED,
                ...options,
            })
            break
        case DefaultStatus.CANNOT_UPDATE_LUGGAGES:
            responseFail(res, {
                status: HttpStatus.BAD_REQUEST,
                message: DefaultStatus.CANNOT_UPDATE_LUGGAGES,
                ...options,
            })
            break
        case DefaultStatus.ERROR:
            responseFail(res, {
                status: HttpStatus.BAD_REQUEST,
                message: DefaultStatus.ERROR,
                ...options,
            })
            break
        case DefaultStatus.UNAUTHORIZED:
            responseFail(res, {
                status: HttpStatus.UNAUTHORIZED,
                message: DefaultStatus.UNAUTHORIZED,
                ...options,
            })
            break
        default:
            responseError(res, HttpStatus.BAD_GATEWAY)
            break
    }
}

export function responseSuccess(res: Res, data: any, options?: Option) {
    const response: any = {
        status: Status.SUCCESS,
        data: {
            ...data,
        },
    }

    if (options?.pagination != null) {
        // response.data = {
        //     ...response.data,
        //     ...options.pagination,
        // }

        const { page, size, total } = options.pagination

        res.setHeader('Content-Range', `item ${page}-${size}/${total}`)
        res.setHeader('Acess-Control-Expose-Headers', 'Content-Range')
    }

    if (options?.headers != null) {
        for (const [key, value] of Object.entries(options.headers)) {
            res.setHeader(key, String(value))
        }
    }

    return res.json(response)
}

export function responseFail(res: Res, options: Options) {
    const response: ResponseFormatToFail = {
        status: Status.FAIL,
        data: {
            code: options.status,
            message: options.message ?? HttpStatus[options.status],
        },
    }

    return res.status(options.status).json(response)
}

export function responseError(res: Res, statusCode: HttpStatus) {
    const response: ResponseFormatToError = {
        status: Status.ERROR,
        data: {
            code: statusCode,
            message: HttpStatus[statusCode],
        },
    }

    return res.status(statusCode).json(response)
}
