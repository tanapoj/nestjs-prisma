import {
    Controller,
    Get,
    Inject,
    Param,
    Query,
    Response,
    UseGuards,
    HttpStatus,
    Request,
    Post,
    Body,
    Put,
    Delete,
} from '@nestjs/common'
import { BookingsDto, CreateBookingsDto, UpdateBookingDto } from '../../models'
import { AgentGuard } from '../../../guards/auth.guard'
import { Log } from '../../../logs'
import { BookingsService } from '../../services'
import { responseSuccess, responseFail, handleResponse } from '../../../common/helper'
import { Response as Res, Request as Req } from 'express'
import { Booking } from 'src/bellugg/entities'
import { BaseQueryPaginateFormat, DefaultStatus } from '../../interfaces'

@Controller()
export class BookingsController {
    constructor(private log: Log, @Inject('BookingsService') private bookingsService: BookingsService) {}

    @Get('oldSystem')
    async getOldSystem(@Response() res: Res, @Query('orderId') orderId: string, @Query('email') email: string) {
        if (orderId == null || email == null) {
            return responseFail(res, {
                status: HttpStatus.BAD_REQUEST,
                message: 'parameter-verification-failed',
                code: 'parameter verification failed',
            })
        }

        const trackBooking = await this.bookingsService.oldSystemfindOneByOrderNumber(orderId, email)
        return responseSuccess(res, trackBooking)
    }

    @UseGuards(AgentGuard)
    @Get('agent/me/delivery/bookings/:bookingId')
    async findByBookingId(@Param('bookingId') bookingId: number, @Request() req: Req, @Response() res: Res) {
        this.log.customDebugLog(`findByBookingId = ${bookingId}`)

        const booking = await this.bookingsService.findOneByOrderId(bookingId)

        if (booking == null) {
            return responseFail(res, {
                status: HttpStatus.NOT_FOUND,
                message: 'Booking not found.',
                code: 'not-found-booking',
            })
        }

        const permissionAgnet = await this.bookingsService.bookingPermission(req, booking)

        if (!permissionAgnet) {
            return responseFail(res, {
                status: HttpStatus.FORBIDDEN,
                message: 'Booking not Permission.',
                code: 'not-permission-booking',
            })
        }

        return responseSuccess(res, booking)
    }

    @UseGuards(AgentGuard)
    @Get('agent/me/delivery/bookings')
    async findByBookingNumber(@Query() booking: BookingsDto, @Request() req: Req, @Response() res: Res) {
        this.log.customDebugLog(`findByBookingNumber = ${booking.bookingNumber}`)
        let bookings: BaseQueryPaginateFormat<Booking[]> = null
        let permissionAgnet = false

        if (booking.bookingNumber == null && booking.agentBookingNumber == null) {
            return responseFail(res, {
                status: HttpStatus.BAD_REQUEST,
                message: 'parameter-verification-failed',
                code: 'parameter verification failed',
            })
        } else if (booking.bookingNumber != null) {
            bookings = await this.bookingsService.findByOrderNumber(booking)

            permissionAgnet = await this.bookingsService.bookingPermission(req, bookings.data)
        } else if (booking.agentBookingNumber != null) {
            bookings = await this.bookingsService.findByAgentBookingId(booking)
            permissionAgnet = await this.bookingsService.bookingPermission(req, bookings.data)
        }

        if (bookings == null) {
            return responseFail(res, {
                status: HttpStatus.NOT_FOUND,
                message: 'Booking not found.',
                code: 'not-found-booking',
            })
        } else if (!permissionAgnet) {
            return responseFail(res, {
                status: HttpStatus.FORBIDDEN,
                message: 'Booking not Permission.',
                code: 'not-permission-booking',
            })
        }

        return responseSuccess(
            res,
            { booking: bookings?.data ?? [] },
            {
                status: HttpStatus.OK,
                pagination: { page: bookings.page, size: bookings?.data?.length ?? 0, total: bookings.total },
            },
        )
    }

    @UseGuards(AgentGuard)
    @Post('agent/me/delivery/booking')
    async createBooking(@Body() booking: CreateBookingsDto, @Request() req: Req, @Response() res: Res) {
        const createBooking = await this.bookingsService.createBooking(booking, req)

        return handleResponse(createBooking.status, res, { booking: createBooking.data })
    }

    @UseGuards(AgentGuard)
    @Put('agent/me/delivery/booking/:bookingId')
    async updateBooking(
        @Param('bookingId') bookingId: number,
        @Body() updateBooking: UpdateBookingDto,
        @Request() req: Req,
        @Response() res: Res,
    ) {
        const bookings = await this.bookingsService.updateBookingId(req, bookingId, updateBooking)
        return handleResponse(bookings.status, res, { booking: bookings.data })
    }

    @UseGuards(AgentGuard)
    @Delete('agent/me/delivery/:bookingId')
    async cancelBooking(@Param('bookingId') bookingId: number, @Request() req: Req, @Response() res: Res) {
        const cancelBooking = await this.bookingsService.cancelBooking(req, bookingId)

        return handleResponse(cancelBooking.status, res, { booking: cancelBooking.data })
    }
}
