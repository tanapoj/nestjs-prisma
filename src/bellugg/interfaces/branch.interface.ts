import { DefaultStatus } from '../interfaces'

export enum AvailableBranch {
    'To' = 'to',
    'From' = 'from',
}

export interface BranchAvailableFormat {
    id: number
    name: string
    address?: string
}

export interface FormatBranchTypeCondition {
    branchConditionId: number
    fromBranchId: number
    toBranchId: number
    fromBranchName: string
    toBranchName: string
    fromBranchTypeName: string
    toBranchTypeName: string
}

export interface FormatBranchType {
    id: number
    branchTypeId: number
    branchName: string
    branchTypeName: string
    active: number
    branchIdSupport?: number
    area?: string
}

export interface FindBranchOption {
    branchId?: number
    lat?: string
    lng?: string
    placeId?: string
    latlng?: string
}

export interface FormatFindOneBranch<T> {
    status: DefaultStatus
    data: T
}
