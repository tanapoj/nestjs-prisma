import { DefaultStatus } from '../interfaces'

export enum TimeStatus {
    'CURRENT' = 'current',
    'OVER_TIME' = 'overTime',
    'START_TIME' = 'startTime',
    'OVERRIDE_TIME' = 'overRideTime',
}

export interface TimeSlot {
    time: string
}

export interface FormatMakeTimeDefault<T> {
    status: DefaultStatus
    data: T
}
