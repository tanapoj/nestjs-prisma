export enum Status {
    'SUCCESS' = 'success',
    'FAIL' = 'fail',
    'ERROR' = 'error',
}

interface MasterMapping {
    status: Status
    code: string
    message: string
}

export const masterQueryStringList = ['page', 'size']

export const masterMappingErrorResponseFormat: Record<string, MasterMapping> = {
    400: {
        status: Status.FAIL,
        code: 'parameter-verification-failed',
        message: 'parameter verification failed',
    },
    403: {
        status: Status.FAIL,
        code: 'forbidden',
        message: 'not have access',
    },
    404: {
        status: Status.FAIL,
        code: 'not-found',
        message: 'item not found',
    },
    401: {
        status: Status.FAIL,
        code: 'unauthorized',
        message: 'authorization required',
    },
    426: {
        status: Status.FAIL,
        code: 'upgrade-required',
        message: 'API version not supported',
    },
    500: {
        status: Status.ERROR,
        code: 'processed failed',
        message: 'cannot processed',
    },
    502: {
        status: Status.ERROR,
        code: 'not-response',
        message: 'invalid response',
    },
    504: {
        status: Status.ERROR,
        code: 'response-timeout',
        message: 'cannot get a response in time',
    },
}

export interface ResponseFormatToSuccess<T> {
    status: Status
    data: Record<string, T>
}

export interface ResponsePaginateFormatToSuccess<T> {
    status: Status
    data: {
        [key: string]: Record<string, any> | number
    }
}

export interface ResponseFormatToFail {
    status: Status.FAIL
    data: {
        code: number
        message: string
    }
}

export interface ResponseFormatToError {
    status: Status.ERROR
    data: {
        code: number
        message: string
    }
}
