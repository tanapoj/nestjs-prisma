import { Inject, Injectable } from '@nestjs/common'
import { DateTime } from 'luxon'
import { TimeSlot, BranchTypeName, FormatMakeTimeDefault, DefaultStatus, TimeStatus } from '../../interfaces'
import { TimeSlotDto } from '../../models'
import { BranchService } from '../../services'
import { Log } from '../../../logs'
import { makeTimeLocal } from '../../../common'

@Injectable()
export class TimeSlotService {
    constructor(@Inject('BranchService') private branchService: BranchService, private log: Log) {}

    public async fromTimeSlotDefault(params: TimeSlotDto): Promise<FormatMakeTimeDefault<TimeSlot[]>> {
        const { from, to } = params

        let result: TimeSlot[] = null
        let pm0: DateTime = null
        let pm8: DateTime = null
        let pm9: DateTime | Date = null
        let pm10: DateTime = null
        let pm12: DateTime = null
        let pm13: DateTime = null
        let pm16: DateTime = null
        let pm23: DateTime = null
        let pm2330: DateTime = null
        let times: TimeSlot[] = []

        let fromDateUtc = DateTime.fromISO(from.date)
        this.log.customDebugLog(`fromDateUtc original =${fromDateUtc.toISODate()}`)

        const current = DateTime.local()
        const fromDateTimeUtc = makeTimeLocal(
            fromDateUtc.year,
            fromDateUtc.month,
            fromDateUtc.day,
            current.hour,
            current.minute,
            current.second,
            false,
        )

        const branchFrom = await this.branchService.findOneBranchType(from.branchId)
        const branchTo = await this.branchService.findOneBranchType(to.branchId)

        if (branchFrom == null || branchTo == null) {
            return {
                data: result,
                status: DefaultStatus.BRANCH_NOTFOUND,
            }
        }

        if (branchFrom.active == 0 || branchTo.active == 0) {
            return {
                data: result,
                status: DefaultStatus.BRANCH_INACTIVE,
            }
        }

        if (branchFrom.branchTypeName == 'AREA') {
            branchFrom['branchTypeName'] = 'HOTEL'
        }

        if (branchTo.branchTypeName == 'AREA') {
            branchTo['branchTypeName'] = 'HOTEL'
        }

        this.log.customDebugLog(`current =${current.toISODate()}`)
        this.log.customDebugLog(`fromDateTimeUtc =${fromDateTimeUtc.toISODate()}`)

        if (fromDateTimeUtc.toISODate() < current.toISODate()) {
            this.log.customDebugLog(`fromDateTimeUtc = ${fromDateTimeUtc.toISO()}`)
            return {
                data: result,
                status: DefaultStatus.FAIL,
            }
        }

        this.log.customDebugLog('fromDateTimeUtc > current')
        this.log.customDebugLog(`fromDateTimeUtc = ${fromDateTimeUtc.toISO()}`)
        this.log.customDebugLog(`branchFrom = ${branchFrom.branchTypeName} branchTo = ${branchTo.branchTypeName}`)

        if (branchFrom.branchTypeName === BranchTypeName.HOTEL && branchTo.branchTypeName === BranchTypeName.HOTEL) {
            this.log.customDebugLog('HOTEL - HOTEL')

            pm9 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 9, 0, 0)
            pm12 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 12, 0, 0)

            if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm12.toISO()) {
                times = []
            } else if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm9.toISO()) {
                times = this.generateTimeSlot(fromDateTimeUtc, pm12)
            } else {
                times = this.generateTimeSlot(pm9, pm12)
            }

            result = times
        } else if (
            branchFrom.branchTypeName === BranchTypeName.HOTEL &&
            branchTo.branchTypeName === BranchTypeName.AIRPORT
        ) {
            this.log.customDebugLog('HOTEL - AIRPORT')

            if ((branchFrom.id == 9 || branchFrom.id == 5) && branchTo.id == 1) {
                pm9 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 9, 0, 0)
                pm12 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 12, 0, 0)
                pm13 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 13, 0, 0)

                if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm13.toISO()) {
                    times = []
                } else if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm9.toISO()) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm13)
                } else {
                    times = this.generateTimeSlot(pm9, pm13)
                }
            } else if ((branchFrom.id == 9 || branchFrom.id == 5) && branchTo.id == 3) {
                pm9 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 9, 0, 0)
                pm12 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 12, 0, 0)
                pm13 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 13, 0, 0)

                this.log.customDebugLog(`fromDateTimeUtc.day > current.day = ${fromDateTimeUtc.day > current.day}`)

                if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm13.toISO()) {
                    times = []
                } else if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm9.toISO()) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm12)
                } else {
                    times = this.generateTimeSlot(pm9, pm13)
                }
            } else {
                pm9 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 9, 0, 0)
                pm12 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 12, 0, 0)

                if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm12.toISO()) {
                    times = []
                } else if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm9.toISO()) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm12)
                } else {
                    times = this.generateTimeSlot(pm9, pm12)
                }
            }

            result = times
        } else if (
            branchFrom.branchTypeName === BranchTypeName.HOTEL &&
            branchTo.branchTypeName === BranchTypeName.BOOTH
        ) {
            //X
        } else if (
            branchFrom.branchTypeName === BranchTypeName.AIRPORT &&
            branchTo.branchTypeName === BranchTypeName.AIRPORT
        ) {
            this.log.customDebugLog('AIRPORT - AIRPORT')

            if (branchFrom.id == 1 && branchTo.id == 3) {
                pm8 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 8, 0, 0)
                pm12 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 12, 0, 0)
                pm23 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 23, 0, 0)

                // this.log.customDebugLog(`pm12 =${pm12.toISO()}`)
                // this.log.customDebugLog(`fromDateTimeUtc =${fromDateTimeUtc.toISO()}`)
                // this.log.customDebugLog(`pm12 day =${pm12.day}`)
                // this.log.customDebugLog(`fromDateTimeUtc day =${fromDateTimeUtc.day}`)

                if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm12.toISO()) {
                    times = []
                } else if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm8.toISO()) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm23)
                } else {
                    times = this.generateTimeSlot(pm8, pm23)
                }
            } else if (branchFrom.id == 3 && branchTo.id == 1) {
                pm0 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 0, 0, 0)
                pm12 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 12, 0, 0)
                pm23 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 23, 0, 0)

                if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm12.toISO()) {
                    times = []
                } else if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm0.toISO()) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm23)
                } else {
                    times = this.generateTimeSlot(pm0, pm23)
                }
            }

            result = times
        } else if (
            branchFrom.branchTypeName === BranchTypeName.AIRPORT &&
            branchTo.branchTypeName === BranchTypeName.HOTEL
        ) {
            if (branchFrom.id == 1 && branchTo.id == 9) {
                pm8 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 8, 0, 0)
                pm12 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 12, 0, 0)
                pm23 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 23, 0, 0)

                if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm12.toISO()) {
                    times = []
                } else if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm0.toISO()) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm23)
                } else {
                    times = this.generateTimeSlot(pm8, pm23)
                }

                result = times
            }
        } else if (
            branchFrom.branchTypeName === BranchTypeName.AIRPORT &&
            branchTo.branchTypeName === BranchTypeName.BOOTH
        ) {
            if (branchFrom.id == 1) {
                pm8 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 8, 0, 0)
                pm2330 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 23, 30, 0)

                if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm8.toISO()) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm2330)
                } else {
                    times = this.generateTimeSlot(pm8, pm2330)
                }
            } else if (branchFrom.id == 3) {
                pm0 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 0, 0, 0)
                pm2330 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 23, 30, 0)

                if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm0.toISO()) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm2330)
                } else {
                    times = this.generateTimeSlot(pm0, pm2330)
                }
            }

            result = times
        } else if (
            branchFrom.branchTypeName === BranchTypeName.BOOTH &&
            branchTo.branchTypeName === BranchTypeName.BOOTH
        ) {
            //X
        } else if (
            branchFrom.branchTypeName === BranchTypeName.BOOTH &&
            branchTo.branchTypeName === BranchTypeName.HOTEL
        ) {
            this.log.customDebugLog('BOOTH - HOTEL')

            if (branchFrom.id == 6 && branchTo.id == 9) {
                pm10 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 10, 0, 0)
                pm12 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 12, 0, 0)
                pm16 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 16, 0, 0)

                if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm12.toISO()) {
                    times = []
                } else if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm10.toISO()) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm16)
                } else {
                    times = this.generateTimeSlot(pm10, pm16)
                }
            } else if (branchFrom.id == 6 && branchTo.id == 5) {
                pm10 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 10, 0, 0)
                pm12 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 12, 0, 0)
                pm16 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 16, 0, 0)

                if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm12.toISO()) {
                    times = []
                } else if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm10.toISO()) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm16)
                } else {
                    times = this.generateTimeSlot(pm10, pm16)
                }
            } else if (branchFrom.id == 7 && branchTo.id == 9) {
                const isWeekend = this.getWeekend(fromDateTimeUtc)

                pm9 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 9, 0, 0)
                pm12 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 12, 0, 0)
                pm16 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 16, 0, 0)

                if ((fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm12.toISO()) || !isWeekend) {
                    times = []
                } else if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm10.toISO() && isWeekend) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm16)
                } else if (fromDateTimeUtc.day > current.day && fromDateTimeUtc.toISO() < pm10.toISO() && isWeekend) {
                    times = this.generateTimeSlot(pm10, pm16)
                }
            } else if (branchFrom.id == 17 && branchTo.id == 9) {
                pm10 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 10, 0, 0)
                pm12 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 12, 0, 0)
                pm13 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 13, 0, 0)

                if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm12.toISO()) {
                    times = []
                } else if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm10.toISO()) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm13)
                } else {
                    times = this.generateTimeSlot(pm10, pm13)
                }
            } else if (branchFrom.id == 17 && branchTo.id == 5) {
                pm10 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 10, 0, 0)
                pm12 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 12, 0, 0)
                pm13 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 13, 0, 0)

                if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm12.toISO()) {
                    times = []
                } else if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm10.toISO()) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm13)
                } else {
                    times = this.generateTimeSlot(pm10, pm13)
                }
            } else if (branchFrom.id == 18 && branchTo.id == 9) {
                pm10 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 10, 0, 0)
                pm12 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 12, 0, 0)
                pm16 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 16, 0, 0)

                if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm12.toISO()) {
                    times = []
                } else if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm10.toISO()) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm16)
                } else {
                    times = this.generateTimeSlot(pm10, pm16)
                }
            } else if (branchFrom.id == 18 && branchTo.id == 5) {
                pm10 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 10, 0, 0)
                pm12 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 12, 0, 0)
                pm16 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 16, 0, 0)

                if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm12.toISO()) {
                    times = []
                } else if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm10.toISO()) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm16)
                } else {
                    times = this.generateTimeSlot(pm10, pm16)
                }
            }

            result = times
        } else if (
            branchFrom.branchTypeName === BranchTypeName.BOOTH &&
            branchTo.branchTypeName === BranchTypeName.AIRPORT
        ) {
            this.log.customDebugLog('BOOTH - AIRPORT')
            if (branchFrom.id == 6 && (branchTo.id == 1 || branchTo.id == 3)) {
                pm10 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 10, 0, 0)
                pm12 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 12, 0, 0)
                pm16 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 16, 0, 0)

                if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm12.toISO()) {
                    times = []
                } else if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm10.toISO()) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm16)
                } else {
                    times = this.generateTimeSlot(pm10, pm16)
                }
            } else if (branchFrom.id == 7 && (branchTo.id == 1 || branchTo.id == 3)) {
                pm9 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 9, 0, 0)
                pm12 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 12, 0, 0)
                pm16 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 16, 0, 0)

                const isWeekend = this.getWeekend(fromDateTimeUtc)
                if ((fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm12.toISO()) || !isWeekend) {
                    times = []
                } else if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm9.toISO() && isWeekend) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm16)
                } else if (fromDateTimeUtc.day > current.day && fromDateTimeUtc.toISO() < pm9.toISO() && isWeekend) {
                    times = this.generateTimeSlot(pm9, pm16)
                }
            } else if (branchFrom.id == 17 && (branchTo.id == 1 || branchTo.id == 3)) {
                pm10 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 10, 0, 0)
                pm12 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 12, 0, 0)
                pm13 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 13, 0, 0)

                if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm12.toISO()) {
                    times = []
                } else if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm10.toISO()) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm13)
                } else if (fromDateTimeUtc.day > current.day && fromDateTimeUtc.toISO() < pm10.toISO()) {
                    times = this.generateTimeSlot(pm10, pm13)
                }
            } else if (branchFrom.id == 18 && (branchTo.id == 1 || branchTo.id == 3)) {
                pm10 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 10, 0, 0)
                pm12 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 12, 0, 0)
                pm16 = makeTimeLocal(fromDateTimeUtc.year, fromDateTimeUtc.month, fromDateTimeUtc.day, 13, 0, 0)

                if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm12.toISO()) {
                    times = []
                } else if (fromDateTimeUtc.day == current.day && fromDateTimeUtc.toISO() > pm10.toISO()) {
                    times = this.generateTimeSlot(fromDateTimeUtc, pm16)
                } else if (fromDateTimeUtc.day > current.day && fromDateTimeUtc.toISO() < pm10.toISO()) {
                    times = this.generateTimeSlot(pm10, pm16)
                }
            }
        }

        return {
            data: result,
            status: DefaultStatus.SUCCESS,
        }
    }

    public async toTimeSlotDefault(params: TimeSlotDto): Promise<FormatMakeTimeDefault<TimeSlot[]>> {
        const { from, to } = params
        let result: TimeSlot[] = null
        let am0: DateTime = null
        let pm9: DateTime = null
        let pm12: DateTime = null
        let pm14: DateTime = null
        let pm16: DateTime = null
        let pm17: DateTime = null
        let pm18: DateTime = null
        let pm19: DateTime = null
        let pm20: DateTime = null
        let pm21: DateTime = null
        let pm22: DateTime = null
        let pm23: DateTime = null
        let pm2330: DateTime = null
        let times: TimeSlot[] = []

        const fromDateUtc = DateTime.fromISO(from.date)
        const fromTimeUtc = DateTime.fromISO(from.time)

        const fromDateTimeUtc = makeTimeLocal(
            fromDateUtc.year,
            fromDateUtc.month,
            fromDateUtc.day,
            fromTimeUtc.hour,
            fromTimeUtc.minute,
            fromTimeUtc.second,
            false,
        ).plus({ seconds: 1 })

        const toDateUtc = DateTime.fromISO(to.date)
        const current = DateTime.local()
        const toDateTimeUtc = makeTimeLocal(
            toDateUtc.year,
            toDateUtc.month,
            toDateUtc.day,
            current.hour,
            current.minute,
            current.second,
            false,
        ).plus({ seconds: 1 })

        const branchFrom = await this.branchService.findOneBranchType(from.branchId)
        const branchTo = await this.branchService.findOneBranchType(to.branchId)

        if (branchFrom == null || branchTo == null) {
            return {
                data: result,
                status: DefaultStatus.BRANCH_NOTFOUND,
            }
        }

        if (branchFrom.active == 0 || branchTo.active == 0) {
            return {
                data: result,
                status: DefaultStatus.BRANCH_INACTIVE,
            }
        }

        this.log.customDebugLog(`branchFrom = ${branchFrom.id}`)
        this.log.customDebugLog(`branchTo = ${branchTo.id}`)

        if (branchFrom.branchTypeName == 'AREA') {
            branchFrom['branchTypeName'] = 'HOTEL'
        }

        if (branchTo.branchTypeName == 'AREA') {
            branchTo['branchTypeName'] = 'HOTEL'
        }

        this.log.customDebugLog(`fromDateTimeUtc = ${fromDateTimeUtc.toISO()}`)
        this.log.customDebugLog(`toDateTimeUtc = ${toDateTimeUtc.toISO()}`)
        this.log.customDebugLog(`current = ${current.toISO()}`)

        if (fromDateTimeUtc.toISO() == null || toDateTimeUtc.toISODate() < current.toISODate()) {
            this.log.customDebugLog(`skip`)
            return {
                status: DefaultStatus.FAIL,
                data: result,
            }
        }

        this.log.customDebugLog(`branchFrom = ${branchFrom.branchTypeName} branchTo = ${branchTo.branchTypeName}`)

        if (branchFrom.branchTypeName == BranchTypeName.HOTEL && branchTo.branchTypeName == BranchTypeName.HOTEL) {
            this.log.customDebugLog('HOTEL - HOTEL')

            am0 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 0, 0, 0)
            pm12 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 12, 0, 0)
            pm19 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 19, 0, 0)
            pm21 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 21, 0, 0)
            pm23 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 23, 0, 0)

            if (branchFrom.id == 9 && branchTo.id == 9) {
                if (
                    toDateTimeUtc.year == fromDateTimeUtc.year &&
                    toDateTimeUtc.month == fromDateTimeUtc.month &&
                    toDateTimeUtc.day == fromDateTimeUtc.day
                ) {
                    if (fromDateTimeUtc.toISO() < pm21.toISO()) {
                        times = this.generateTimeSlot(pm21, pm23)
                    } else {
                        times = []
                    }
                } else {
                    times = this.generateTimeSlot(am0, pm23)
                }
            } else if (branchFrom.id == 9 && branchTo.id == 5) {
                if (
                    toDateTimeUtc.year == fromDateTimeUtc.year &&
                    toDateTimeUtc.month == fromDateTimeUtc.month &&
                    toDateTimeUtc.day == fromDateTimeUtc.day
                ) {
                    times = this.generateTimeSlot(pm21, pm23)
                } else {
                    times = this.generateTimeSlot(am0, pm23)
                }
            } else if (branchFrom.id == 5 && branchTo.id == 9) {
                if (
                    toDateTimeUtc.year == fromDateTimeUtc.year &&
                    toDateTimeUtc.month == fromDateTimeUtc.month &&
                    toDateTimeUtc.day == fromDateTimeUtc.day
                ) {
                    times = this.generateTimeSlot(pm21, pm23)
                } else {
                    times = this.generateTimeSlot(am0, pm23)
                }
            } else if (branchFrom.id == 5 && branchTo.id == 5) {
                // X
            } else if (branchFrom.id == 15 && branchTo.id == 9) {
                if (
                    toDateTimeUtc.year == fromDateTimeUtc.year &&
                    toDateTimeUtc.month == fromDateTimeUtc.month &&
                    toDateTimeUtc.day == fromDateTimeUtc.day
                ) {
                    times = this.generateTimeSlot(pm21, pm23)
                } else {
                    times = this.generateTimeSlot(am0, pm23)
                }
            } else if (branchFrom.id == 9 && branchTo.id == 15) {
                if (
                    toDateTimeUtc.year == fromDateTimeUtc.year &&
                    toDateTimeUtc.month == fromDateTimeUtc.month &&
                    toDateTimeUtc.day == fromDateTimeUtc.day
                ) {
                    times = this.generateTimeSlot(pm21, pm23)
                } else {
                    times = this.generateTimeSlot(am0, pm23)
                }
            } else if (branchFrom.id == 13 && branchTo.id == 13) {
                if (
                    toDateTimeUtc.year == fromDateTimeUtc.year &&
                    toDateTimeUtc.month == fromDateTimeUtc.month &&
                    toDateTimeUtc.day == fromDateTimeUtc.day
                ) {
                    times = this.generateTimeSlot(pm21, pm23)
                } else {
                    times = this.generateTimeSlot(am0, pm23)
                }
            } else if (branchFrom.id == 21 && branchTo.id == 9) {
                if (
                    toDateTimeUtc.year == fromDateTimeUtc.year &&
                    toDateTimeUtc.month == fromDateTimeUtc.month &&
                    toDateTimeUtc.day == fromDateTimeUtc.day
                ) {
                    times = this.generateTimeSlot(pm21, pm23)
                } else {
                    times = this.generateTimeSlot(am0, pm23)
                }
            } else if (branchFrom.id == 9 && branchTo.id == 21) {
                if (
                    toDateTimeUtc.year == fromDateTimeUtc.year &&
                    toDateTimeUtc.month == fromDateTimeUtc.month &&
                    toDateTimeUtc.day == fromDateTimeUtc.day
                ) {
                    times = this.generateTimeSlot(pm21, pm23)
                } else {
                    times = this.generateTimeSlot(am0, pm23)
                }
            } else if (branchFrom.id == 23 && branchTo.id == 9) {
                if (
                    toDateTimeUtc.year == fromDateTimeUtc.year &&
                    toDateTimeUtc.month == fromDateTimeUtc.month &&
                    toDateTimeUtc.day == fromDateTimeUtc.day
                ) {
                    times = this.generateTimeSlot(pm21, pm23)
                } else {
                    times = this.generateTimeSlot(am0, pm23)
                }
            } else if (branchFrom.id == 9 && branchTo.id == 23) {
                if (
                    toDateTimeUtc.year == fromDateTimeUtc.year &&
                    toDateTimeUtc.month == fromDateTimeUtc.month &&
                    toDateTimeUtc.day == fromDateTimeUtc.day
                ) {
                    times = this.generateTimeSlot(pm21, pm23)
                } else {
                    times = this.generateTimeSlot(am0, pm23)
                }
            }

            result = times
        } else if (
            branchFrom.branchTypeName == BranchTypeName.HOTEL &&
            branchTo.branchTypeName == BranchTypeName.AIRPORT
        ) {
            this.log.customDebugLog('HOTEL - AIRPORT')

            am0 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 0, 0, 0)
            pm9 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 9, 0, 0)
            pm12 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 12, 0, 0)
            pm19 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 19, 0, 0)
            pm23 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 23, 0, 0)

            if (
                toDateTimeUtc.year == fromDateTimeUtc.year &&
                toDateTimeUtc.month == fromDateTimeUtc.month &&
                toDateTimeUtc.day == fromDateTimeUtc.day
            ) {
                if (fromDateTimeUtc.toISO() <= pm12.toISO()) {
                    times = this.generateTimeSlot(pm19, pm23)
                } else {
                    times = []
                }
            } else {
                times = this.generateTimeSlot(am0, pm23)
            }

            result = times
        } else if (
            branchFrom.branchTypeName == BranchTypeName.HOTEL &&
            branchTo.branchTypeName == BranchTypeName.BOOTH
        ) {
            //X
        } else if (
            branchFrom.branchTypeName == BranchTypeName.AIRPORT &&
            branchTo.branchTypeName == BranchTypeName.AIRPORT
        ) {
            this.log.customDebugLog('AIRPORT - AIRPORT')

            const receiveToday_14pm = makeTimeLocal(
                fromDateTimeUtc.year,
                fromDateTimeUtc.month,
                fromDateTimeUtc.day,
                14,
                0,
                0,
            )
            const receiveToday_17pm = makeTimeLocal(
                fromDateTimeUtc.year,
                fromDateTimeUtc.month,
                fromDateTimeUtc.day,
                17,
                0,
                0,
            )

            am0 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 0, 0, 0)
            pm20 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 20, 0, 0)
            pm21 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 21, 0, 0)
            pm2330 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 23, 30, 0)

            if (
                toDateTimeUtc.year == fromDateTimeUtc.year &&
                toDateTimeUtc.month == fromDateTimeUtc.month &&
                toDateTimeUtc.day == fromDateTimeUtc.day
            ) {
                if (fromDateTimeUtc.toISO() <= receiveToday_14pm.toISO()) {
                    times = this.generateTimeSlot(pm20, pm2330)
                } else if (fromDateTimeUtc.toISO() <= receiveToday_17pm.toISO()) {
                    times = this.generateTimeSlot(pm21, pm2330)
                } else {
                    times = []
                }
            } else {
                times = this.generateTimeSlot(am0, pm2330)
            }

            result = times
        } else if (
            branchFrom.branchTypeName == BranchTypeName.AIRPORT &&
            branchTo.branchTypeName == BranchTypeName.HOTEL
        ) {
            this.log.customDebugLog('AIRPORT - HOTEL')

            am0 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 0, 0, 0)
            pm9 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 9, 0, 0)
            pm12 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 12, 0, 0)
            pm16 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 16, 0, 0)
            pm17 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 17, 0, 0)
            pm19 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 19, 0, 0)
            pm21 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 21, 0, 0)
            pm23 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 23, 0, 0)
            pm2330 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 23, 30, 0)

            if (branchFrom.id == 14 && branchTo.id == 13) {
                if (
                    toDateTimeUtc.year == fromDateTimeUtc.year &&
                    toDateTimeUtc.month == fromDateTimeUtc.month &&
                    toDateTimeUtc.day == fromDateTimeUtc.day
                ) {
                    times = this.generateTimeSlot(pm19, pm23)
                } else {
                    times = this.generateTimeSlot(am0, pm23)
                }
            } else if (branchFrom.id == 3 && branchTo.id == 21) {
                if (
                    toDateTimeUtc.year == fromDateTimeUtc.year &&
                    toDateTimeUtc.month == fromDateTimeUtc.month &&
                    toDateTimeUtc.day == fromDateTimeUtc.day
                ) {
                    times = this.generateTimeSlot(pm21, pm23)
                } else {
                    times = this.generateTimeSlot(am0, pm23)
                }
            } else if (branchFrom.id == 1 && branchTo.id == 21) {
                if (
                    toDateTimeUtc.year == fromDateTimeUtc.year &&
                    toDateTimeUtc.month == fromDateTimeUtc.month &&
                    toDateTimeUtc.day == fromDateTimeUtc.day
                ) {
                    times = this.generateTimeSlot(pm21, pm23)
                } else {
                    times = this.generateTimeSlot(am0, pm23)
                }
            } else if (branchFrom.id == 3 && branchTo.id == 23) {
                if (
                    toDateTimeUtc.year == fromDateTimeUtc.year &&
                    toDateTimeUtc.month == fromDateTimeUtc.month &&
                    toDateTimeUtc.day == fromDateTimeUtc.day
                ) {
                    times = this.generateTimeSlot(pm21, pm23)
                } else {
                    times = this.generateTimeSlot(am0, pm23)
                }
            } else if (branchFrom.id == 1 && branchTo.id == 23) {
                if (
                    toDateTimeUtc.year == fromDateTimeUtc.year &&
                    toDateTimeUtc.month == fromDateTimeUtc.month &&
                    toDateTimeUtc.day == fromDateTimeUtc.day
                ) {
                    times = this.generateTimeSlot(pm21, pm23)
                } else {
                    times = this.generateTimeSlot(am0, pm23)
                }
            } else {
                if (
                    toDateTimeUtc.year == fromDateTimeUtc.year &&
                    toDateTimeUtc.month == fromDateTimeUtc.month &&
                    toDateTimeUtc.day == fromDateTimeUtc.day
                ) {
                    if (fromDateTimeUtc.toISO() <= pm16.toISO()) {
                        times = this.generateTimeSlot(pm21, pm2330)
                    } else {
                        times = []
                    }
                } else {
                    times = this.generateTimeSlot(pm21, pm2330)
                }
            }

            result = times
        } else if (
            branchFrom.branchTypeName == BranchTypeName.AIRPORT &&
            branchTo.branchTypeName == BranchTypeName.BOOTH
        ) {
            this.log.customDebugLog('AIRPORT - BOOTH')

            const receiveToday_12pm = makeTimeLocal(
                fromDateTimeUtc.year,
                fromDateTimeUtc.month,
                fromDateTimeUtc.day,
                12,
                0,
                0,
            )

            pm17 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 17, 0, 0)
            pm18 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 18, 0, 0)
            pm22 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 22, 0, 0)
            const isWeekend = this.getWeekend(fromDateTimeUtc)
            if (branchTo.id == 6) {
                if (fromDateTimeUtc.toISO() <= receiveToday_12pm.toISO()) {
                    times = this.generateTimeSlot(pm17, pm22)
                } else {
                    times = []
                }
            } else if (branchTo.id == 7) {
                if (!isWeekend) {
                    times = []
                } else if (fromDateTimeUtc.toISO() <= receiveToday_12pm.toISO() && isWeekend) {
                    times = this.generateTimeSlot(pm17, pm18)
                } else {
                    times = []
                }
            } else if (branchTo.id == 17) {
                if (fromDateTimeUtc.toISO() <= receiveToday_12pm.toISO()) {
                    times = this.generateTimeSlot(pm17, pm22)
                } else {
                    times = []
                }
            }

            result = times
        } else if (
            branchFrom.branchTypeName == BranchTypeName.BOOTH &&
            branchTo.branchTypeName == BranchTypeName.BOOTH
        ) {
            // X
        } else if (
            branchFrom.branchTypeName == BranchTypeName.BOOTH &&
            branchTo.branchTypeName == BranchTypeName.HOTEL
        ) {
            this.log.customDebugLog('BOOTH - HOTEL')

            am0 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 0, 0, 0)
            pm9 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 9, 0, 0)
            pm21 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 21, 0, 0)
            pm23 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 23, 0, 0)

            if (
                toDateTimeUtc.year == fromDateTimeUtc.year &&
                toDateTimeUtc.month == fromDateTimeUtc.month &&
                toDateTimeUtc.day == fromDateTimeUtc.day
            ) {
                times = this.generateTimeSlot(pm21, pm23)
            } else {
                times = this.generateTimeSlot(am0, pm23)
            }

            result = times
        } else if (
            branchFrom.branchTypeName == BranchTypeName.BOOTH &&
            branchTo.branchTypeName == BranchTypeName.AIRPORT
        ) {
            this.log.customDebugLog('BOOTH - AIRPORT')

            am0 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 0, 0, 0)
            pm9 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 9, 0, 0)
            pm14 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 14, 0, 0)
            pm18 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 18, 0, 0)
            pm19 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 19, 0, 0)
            pm20 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 20, 0, 0)
            pm23 = makeTimeLocal(toDateTimeUtc.year, toDateTimeUtc.month, toDateTimeUtc.day, 23, 0, 0)

            if (
                toDateTimeUtc.year == fromDateTimeUtc.year &&
                toDateTimeUtc.month == fromDateTimeUtc.month &&
                toDateTimeUtc.day == fromDateTimeUtc.day
            ) {
                if (branchFrom.id == 17) {
                    times = this.generateTimeSlot(pm19, pm23)
                } else {
                    if (branchFrom.id == 1) {
                        if (fromDateTimeUtc.toISO() < pm14.toISO()) {
                            times = this.generateTimeSlot(pm18, pm23)
                        } else {
                            times = this.generateTimeSlot(pm20, pm23)
                        }
                    } else {
                        times = this.generateTimeSlot(pm19, pm23)
                    }
                }
            } else {
                times = this.generateTimeSlot(am0, pm23)
            }

            result = times
        }

        return {
            status: DefaultStatus.SUCCESS,
            data: result,
        }
    }

    public generateTimeSlot(startTime: DateTime, endTime: DateTime, interval = { minutes: 30 }): TimeSlot[] {
        const times: TimeSlot[] = []
        this.log.customDebugLog(`generateTimeSlot startTime = ${startTime}`)
        this.log.customDebugLog(`hour = ${startTime.hour}`)
        let minDatetime: DateTime = makeTimeLocal(
            startTime.year,
            startTime.month,
            startTime.day,
            startTime.hour,
            0,
            0,
            false,
        )
        const maxDatetime = endTime

        if (startTime.minute >= 30) {
            minDatetime = minDatetime.plus({
                hour: 1,
            })
        } else if (startTime.minute >= 1) {
            minDatetime = minDatetime.plus({
                minutes: 30,
            })
        }

        this.log.customDebugLog(`minDatetime = ${minDatetime.toISOTime()}`)
        this.log.customDebugLog(`maxDatetime = ${maxDatetime.toISOTime()}`)

        for (let x = minDatetime.hour; minDatetime.toISO() <= maxDatetime.toISO(); x++) {
            if (minDatetime > maxDatetime) break

            const formatTime = `${minDatetime.toISOTime().split('.')[0]}Z`
            times.push({ time: formatTime })
            minDatetime = minDatetime.plus(interval)
        }

        return times
    }

    private getWeekend(dt: DateTime): boolean {
        if (dt.weekday != 6 && dt.weekday != 7) {
            return true
        }

        return false
    }

    public async findBranchIdByPlace(place: string, placeId?: string): Promise<number> {
        return this.branchService.findOneBranchIdOldSystem(place, placeId)
    }
}
