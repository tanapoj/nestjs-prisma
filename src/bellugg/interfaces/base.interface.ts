import { HttpStatus } from '@nestjs/common'

export interface FormatResultService<T> {
    status: DefaultStatus
    data: T
}

export enum DefaultStatus {
    'ERROR' = 'error',
    'SUCCESS' = 'success',
    'FAIL' = 'fail',
    'BRANCH_NOTFOUND' = 'branch not found',
    'BRANCH_INACTIVE' = 'branch inactive',
    'UNKNOWNERROR' = 'unknown error',
    'BRANCH_CONDITION_NOTFOUND' = 'branch condition not found',
    'UNAUTHORIZED' = 'unauthorized',
    'IMAGETOOLARGE' = 'image too large',
    'CANNOT_UPDATE_LUGGAGES' = 'cannot update luggages',
    'UPDATE_LUGGAGES_FAILED' = 'update luggages failed',
    'BOOKING_NOTFOUND' = 'booking not found',
    'UPDATE_IMGE_LUGGAGES_FAILED' = 'update image luggages failed',
    'CANCEL_BOOKING_FAILED' = 'cancel booking failed',
}

export enum ServiceType {
    'DELIVERY' = 'DELIVERY',
    'STORAGE' = 'STORAGE',
}

export enum LocationType {
    'FROM' = 'FROM',
    'TO' = 'TO',
}

export interface Option {
    pagination?: PaginateFormat
    headers?: Record<string, any>
    status: HttpStatus
}

export interface BaseQueryFormat<T> {
    data: T
}

export interface PaginateFormat {
    page: number
    size: number
    total: number
}

export interface BaseQueryPaginateFormat<T> extends BaseQueryFormat<T>, PaginateFormat {}

export enum Language {
    'EN' = 'en',
    'TH' = 'th',
}
