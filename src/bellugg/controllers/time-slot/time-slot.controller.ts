import { Controller, Get, Body, Response, HttpStatus, Inject, Query, UseGuards } from '@nestjs/common'
import { Response as Res } from 'express'
import { TimeSlotService, BranchService } from '../../services'
import { Log } from '../../../logs'
import { TimeSlotDto, TimeSlotQueryDto } from '../../models'
import { LocationType, TimeSlot, FormatMakeTimeDefault, DefaultStatus } from '../../interfaces'
import { AgentGuard } from '../../../guards/auth.guard'
import { getBranchTransformType, BranchTransform, handleResponse, responseSuccess, responseFail } from '../../../common'

@Controller()
export class TimeSlotController {
    constructor(
        @Inject('TimeSlotService') private timeSlotService: TimeSlotService,
        @Inject('BranchService') private branchService: BranchService,
        private log: Log,
    ) {}

    @UseGuards(AgentGuard)
    @Get('/agent/me/timeslots')
    async findTimeSlots(@Query() query: TimeSlotQueryDto, @Body() body: TimeSlotDto, @Response() res: Res) {
        let timeSlots: FormatMakeTimeDefault<TimeSlot[]> = null
        this.log.customDebugLog(`body = ${JSON.stringify(body)}`)
        this.log.customDebugLog(`query = ${JSON.stringify(query)}`)

        const branchTransform = getBranchTransformType<TimeSlotDto>(body)

        if (query.locationType == LocationType.FROM) {
            this.log.customDebugLog(`start process type = ${JSON.stringify(query)}`)

            if (branchTransform == BranchTransform.FAIL) {
                return responseFail(res, {
                    status: HttpStatus.BAD_REQUEST,
                    message: 'parameter-verification-failed',
                    code: 'parameter verification failed',
                })
            }

            if (branchTransform == BranchTransform.BRANCHID_TO_BRANCHID && body.from?.date != null) {
                const branchFrom = await this.branchService.findOneBranch(body.from.branchId)
                const branchTo = await this.branchService.findOneBranch(body.to.branchId)

                if (branchFrom.status != DefaultStatus.SUCCESS) {
                    return handleResponse(branchFrom.status, res)
                }

                if (branchTo.status != DefaultStatus.SUCCESS) {
                    return handleResponse(branchTo.status, res)
                }

                timeSlots = await this.timeSlotService.fromTimeSlotDefault(body)
            } else if (branchTransform == BranchTransform.BRANCHID_TO_LATLNG && body.from?.date != null) {
                const branchFrom = await this.branchService.findOneBranch(body.from.branchId)
                const branchTo = await this.branchService.findOneBranchCustom({
                    latlng: body.to.latLng,
                    placeId: body.to.placeId,
                })

                if (branchFrom.status != DefaultStatus.SUCCESS) {
                    return handleResponse(branchFrom.status, res)
                }

                if (branchTo.status != DefaultStatus.SUCCESS) {
                    return handleResponse(branchTo.status, res)
                }

                body.to.branchId = branchTo.data.id
                body.to.latLng = null
                timeSlots = await this.timeSlotService.fromTimeSlotDefault(body)
            } else if (branchTransform == BranchTransform.LATLNG_TO_BRANCHID && body.from?.date != null) {
                const branchFrom = await this.branchService.findOneBranchCustom({
                    latlng: body.from.latLng,
                    placeId: body.from.placeId,
                })
                const branchTo = await this.branchService.findOneBranch(body.to.branchId)

                if (branchFrom.status != DefaultStatus.SUCCESS) {
                    return handleResponse(branchFrom.status, res)
                }

                if (branchTo.status != DefaultStatus.SUCCESS) {
                    return handleResponse(branchTo.status, res)
                }

                body.from.branchId = branchFrom.data.id
                body.from.latLng = null
                timeSlots = await this.timeSlotService.fromTimeSlotDefault(body)
            } else if (branchTransform == BranchTransform.LATLNG_TO_LATLNG && body.from.date != null) {
                const branchFrom = await this.branchService.findOneBranchCustom({
                    latlng: body.from.latLng,
                    placeId: body.from.placeId,
                })
                const branchTo = await this.branchService.findOneBranchCustom({
                    latlng: body.to.latLng,
                    placeId: body.to.placeId,
                })

                if (branchFrom.status != DefaultStatus.SUCCESS) {
                    return handleResponse(branchFrom.status, res)
                }

                if (branchTo.status != DefaultStatus.SUCCESS) {
                    return handleResponse(branchTo.status, res)
                }

                body.from.branchId = branchFrom.data.id
                body.from.latLng = null
                body.to.branchId = branchTo.data.id
                body.to.latLng = null

                timeSlots = await this.timeSlotService.fromTimeSlotDefault(body)
            }

            if (timeSlots.status != DefaultStatus.SUCCESS) {
                return handleResponse(timeSlots.status, res)
            }

            return responseSuccess(
                res,
                { timeSlots: timeSlots },
                {
                    status: HttpStatus.OK,
                },
            )
        } else {
            if (branchTransform == BranchTransform.FAIL) {
                return responseFail(res, {
                    status: HttpStatus.BAD_REQUEST,
                    message: 'parameter-verification-failed',
                    code: 'parameter verification failed',
                })
            }

            if (
                branchTransform == BranchTransform.BRANCHID_TO_BRANCHID &&
                body.from?.date != null &&
                body.from?.time != null
            ) {
                const branchFrom = await this.branchService.findOneBranch(body.from.branchId)
                const branchTo = await this.branchService.findOneBranch(body.to.branchId)

                if (branchFrom.status != DefaultStatus.SUCCESS) {
                    return handleResponse(branchFrom.status, res)
                }

                if (branchTo.status != DefaultStatus.SUCCESS) {
                    return handleResponse(branchTo.status, res)
                }

                this.log.customDebugLog(`start process type = ${JSON.stringify(query)}`)
                timeSlots = await this.timeSlotService.toTimeSlotDefault(body)
            } else if (
                branchTransform == BranchTransform.BRANCHID_TO_LATLNG &&
                body.from?.date != null &&
                body.from?.time != null
            ) {
                const branchFrom = await this.branchService.findOneBranch(body.from.branchId)
                const branchTo = await this.branchService.findOneBranchCustom({
                    latlng: body.to.latLng,
                    placeId: body.to.placeId,
                })

                if (branchFrom.status != DefaultStatus.SUCCESS) {
                    return handleResponse(branchFrom.status, res)
                }

                if (branchTo.status != DefaultStatus.SUCCESS) {
                    return handleResponse(branchTo.status, res)
                }

                body.to.branchId = branchTo.data.id
                body.to.latLng = null
                timeSlots = await this.timeSlotService.toTimeSlotDefault(body)
            } else if (
                branchTransform == BranchTransform.LATLNG_TO_BRANCHID &&
                body.from?.date != null &&
                body.from?.time != null
            ) {
                const branchFrom = await this.branchService.findOneBranchCustom({
                    latlng: body.from.latLng,
                    placeId: body.from.placeId,
                })
                const branchTo = await this.branchService.findOneBranch(body.to.branchId)

                if (branchFrom.status != DefaultStatus.SUCCESS) {
                    return handleResponse(branchFrom.status, res)
                }

                if (branchTo.status != DefaultStatus.SUCCESS) {
                    return handleResponse(branchTo.status, res)
                }

                body.from.branchId = branchFrom.data.id
                body.from.latLng = null
                timeSlots = await this.timeSlotService.toTimeSlotDefault(body)
            } else if (
                branchTransform == BranchTransform.LATLNG_TO_LATLNG &&
                body.from?.date != null &&
                body.from?.time != null
            ) {
                const branchFrom = await this.branchService.findOneBranchCustom({
                    latlng: body.from.latLng,
                    placeId: body.from.placeId,
                })
                const branchTo = await this.branchService.findOneBranchCustom({
                    latlng: body.to.latLng,
                    placeId: body.to.placeId,
                })

                if (branchFrom.status != DefaultStatus.SUCCESS) {
                    return handleResponse(branchFrom.status, res)
                }

                if (branchTo.status != DefaultStatus.SUCCESS) {
                    return handleResponse(branchTo.status, res)
                }

                body.from.branchId = branchFrom.data.id
                body.from.latLng = null
                body.to.branchId = branchTo.data.id
                body.to.latLng = null
                timeSlots = await this.timeSlotService.toTimeSlotDefault(body)
            }

            if (timeSlots.status != DefaultStatus.SUCCESS) {
                return handleResponse(timeSlots.status, res)
            }

            return responseSuccess(
                res,
                { timeSlots: timeSlots },
                {
                    status: HttpStatus.OK,
                },
            )
        }
    }
}
