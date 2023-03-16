import { Inject, Injectable, Request } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { BookingsDto, CreateBookingsDto, UpdateBookingDto } from '../../models'
import { BranchCondition, Branch, BranchType, Coordinates, Order, Booking, Luggage } from '../../entities'
import {
    ImageOrderService,
    OldSystemService,
    AgentService,
    AuthService,
    BranchService,
    LuggageService,
} from '../../services'
import { Log } from '../../../logs'
import {
    BaseQueryPaginateFormat,
    ServiceType,
    BookingLuggage,
    BookingStatus,
    OldSystemBookingProps,
    ProductBookingProps,
    DefaultStatus,
    FormatBranchTypeCondition,
    FormatCreateBooking,
    ResponseBookingDetail,
    TrackStatus,
    FormatResultService,
} from '../../interfaces'
import { Request as Req } from 'express'
import {
    mappingLatlng,
    BranchTransformInterface,
    getBranchTransformType,
    BranchTransform,
    calculateImgSizeInKb,
} from '../../../common'
import { DateTime } from 'luxon'
import { ConfigService } from 'src/config'
import { makeTimeLocal } from '../../../common'

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Order)
        private repo: Repository<Order>,
        @Inject('ImageOrderService')
        private imageOrderService: ImageOrderService,
        @Inject('AgentService')
        private agentService: AgentService,
        @Inject('OldSystemService')
        private oldSystemService: OldSystemService,
        @Inject('AuthService')
        private authService: AuthService,
        @Inject('BranchService')
        private branchService: BranchService,
        @Inject('ConfigService')
        private configService: ConfigService,
        @Inject('LuggageService')
        private luggageService: LuggageService,
        private log: Log,
    ) {}

    public async oldSystemfindOneByOrderNumber(order_number: string, email: string): Promise<Record<string, any>> {
        return this.oldSystemService.findBooking(order_number, email)
    }

    private makeSocial(payload: string): { socialType: string; socialId: string } | null {
        if (payload == null) return
        const str = payload.split(':')
        const socialType = str[0]
        const socialId = str[1]

        return { socialType, socialId }
    }

    private makeOldSystemSocial(socialType: string, socialId: string): string {
        if (socialType == null || socialId == null) return
        const result = `${socialType}:${socialId}`

        return result
    }

    private makeOldSystemLuggage(data: ProductBookingProps[]): string[] {
        return data.filter(item => item.amount > 0).map(item => `${item.id},${item.amount}`)
    }

    private makeLatAndLng(payload: string): { lat: string; lng: string } | null {
        if (payload == null) return

        const str = payload.split(',')

        const lat = str[0]
        const lng = str[1]

        return { lat, lng }
    }

    public async findByOrderNumber(bookingNumber: BookingsDto): Promise<BaseQueryPaginateFormat<Booking[]>> {
        let total = 0
        let result: Booking[] = []
        const startPagination = (bookingNumber.page - 1) * bookingNumber.size

        const query = this.findRawQuery().where('book.order_number = :bookingNumber', {
            bookingNumber: bookingNumber.bookingNumber,
        })

        total = await query.getCount()
        const bookings = await query.offset(startPagination).limit(bookingNumber.size).getRawMany<{
            id: number
            memerId: number
            orderTypeId: number
            bookingNumber: string
            customerName: string
            passportNo: string
            email: string
            bookingStatus: number
            social?: string
            phone?: string
            branchFromId?: number
            branchFromTypeId?: number
            branchFromplaceId?: string
            branchToId?: number
            branchToTypeId?: number
            branchToplaceId?: string
            agentId: number
            flightNo?: string
            branchFromName?: string
            branchTomName?: string
            coordinatesFrom?: string
            coordinatesTo?: string
            remark?: string
            dropoffDatetime?: Date
            pickupDatetime?: Date
        }>()

        if (total === 0) return

        if (bookings.length > 0) {
            result = await Promise.all(
                bookings.map(async order => {
                    const imgs = await this.imageOrderService.findOneByOrderId(order.id)
                    const urls: string[] = imgs.map(img => img.url)

                    const orderOldSystem = await this.oldSystemService.findBooking(order?.bookingNumber, order?.email)

                    const products: BookingLuggage[] =
                        orderOldSystem.data[1]?.size_lug_list.map(product => {
                            let amount = product?.qty_booking
                            if (product?.qty_edit != null && product?.qty_edit > 0) {
                                amount = product?.qty_edit
                            }
                            return {
                                id: product.size_id,
                                amount,
                            }
                        }) ?? []

                    // this.log.customDebugLog(orderOldSystem)

                    const booking: Booking = {
                        id: order.id,
                        bookingNumber: order.bookingNumber,
                        agentBookingNumber: order.agentId.toString(),
                        bookingStatus: BookingStatus[order.bookingStatus],
                        fullName: order.customerName,
                        email: order.email,
                        socialType: this.makeSocial(order.social)?.socialType,
                        socialId: this.makeSocial(order.social)?.socialId,
                        passportNo: order.passportNo,
                        citizenId: '',
                        phone: order.phone,
                        flightNumber: order.flightNo,
                        remark: order.remark,
                        serviceType: ServiceType.DELIVERY,
                        products: products,
                        from: {
                            id: order.branchFromId,
                            type: order.branchFromName,
                            placeId: order.branchFromplaceId,
                            lat: this.makeLatAndLng(order.coordinatesFrom)?.lat,
                            lng: this.makeLatAndLng(order.coordinatesFrom)?.lng,
                            datetime: order.dropoffDatetime,
                        },
                        to: {
                            id: order.branchToId,
                            type: order.branchTomName,
                            placeId: order.branchToplaceId,
                            lat: this.makeLatAndLng(order.coordinatesTo)?.lat,
                            lng: this.makeLatAndLng(order.coordinatesTo)?.lng,

                            datetime: order.pickupDatetime,
                        },
                        imageLuggages: urls,
                        agentId: order.agentId,
                    }

                    return booking
                }),
            )
        }

        return {
            total,
            page: bookingNumber.page,
            size: bookingNumber.size,
            data: result,
        }
    }

    public async findOneByOrderId(bookingId: number): Promise<Booking> {
        const urls: string[] = []
        const order = await this.findRawQuery().where('book.order_id = :bookingId', { bookingId }).getRawOne<{
            id: number
            memerId: number
            orderTypeId: number
            bookingNumber: string
            customerName: string
            passportNo: string
            email: string
            bookingStatus: number
            social?: string
            phone?: string
            branchFromId?: number
            branchFromTypeId?: number
            branchFromplaceId?: string
            branchToId?: number
            branchToTypeId?: number
            branchToplaceId?: string
            agentId: number
            flightNo?: string
            branchFromName?: string
            branchTomName?: string
            coordinatesFrom?: string
            coordinatesTo?: string
            remark?: string
            dropoffDatetime?: Date
            pickupDatetime?: Date
        }>()

        if (order == null) return

        const imgs = await this.imageOrderService.findOneByOrderId(order.id)

        if (imgs?.length > 0) {
            imgs.forEach(img => {
                if (img != null && img.url != '') {
                    urls.push(img.url)
                }
            })
        }

        const orderOldSystem = await this.oldSystemService.findBooking(order?.bookingNumber, order?.email)

        // this.log.customDebugLog(`orderOldSystem.data.data[1]['size_lug_list']`)
        // this.log.customDebugLog(orderOldSystem.data.data[1]['size_lug_list'])
        // this.log.customDebugLog(`orderOldSystem.data[1].size_lug_list`)
        // this.log.customDebugLog(orderOldSystem.data[1].size_lug_list)

        const products: BookingLuggage[] =
            orderOldSystem?.data?.[1]?.['size_lug_list']?.map(product => {
                let amount = product?.qty_booking
                if (product?.qty_edit != null && product?.qty_edit > 0) {
                    amount = product?.qty_edit
                }
                return {
                    id: product.size_id,
                    amount,
                }
            }) ?? []

        const booking: Booking = {
            id: order.id,
            bookingNumber: order.bookingNumber,
            agentBookingNumber: order.agentId.toString(),
            bookingStatus: BookingStatus[order.bookingStatus],
            fullName: order.customerName,
            email: order.email,
            socialType: this.makeSocial(order.social)?.socialType,
            socialId: this.makeSocial(order.social)?.socialId,
            passportNo: order.passportNo,
            citizenId: '',
            phone: order.phone,
            flightNumber: order.flightNo,
            remark: order.remark,
            serviceType: ServiceType.DELIVERY,
            products: products,
            from: {
                id: order.branchFromId,
                type: order.branchFromName,
                placeId: order.branchFromplaceId,
                lat: this.makeLatAndLng(order.coordinatesFrom)?.lat,
                lng: this.makeLatAndLng(order.coordinatesFrom)?.lng,
                datetime: order.dropoffDatetime,
            },
            to: {
                id: order.branchToId,
                type: order.branchTomName,
                placeId: order.branchToplaceId,
                lat: this.makeLatAndLng(order.coordinatesTo)?.lat,
                lng: this.makeLatAndLng(order.coordinatesTo)?.lng,

                datetime: order.pickupDatetime,
            },
            imageLuggages: urls,
            agentId: order.agentId,
        }

        return booking
    }

    public async findByAgentBookingId(agentBooking: BookingsDto): Promise<BaseQueryPaginateFormat<Booking[]>> {
        let total = 0
        let booking: Booking[] = []
        const startPagination = (agentBooking.page - 1) * agentBooking.size

        // this.log.customDebugLog(agentBooking)
        this.log.customDebugLog(`page=${agentBooking.page}`)

        this.log.customDebugLog(`size=${agentBooking.size}`)

        const query = this.findRawQuery().where('book.ref_id = :agentBookingId', {
            agentBookingId: agentBooking.agentBookingNumber,
        })

        total = await query.getCount()

        if (total === 0) return

        this.log.customDebugLog(`startPagination=${startPagination}`)

        this.log.customDebugLog(`size=${agentBooking.size}`)

        const orders = await query.offset(startPagination).limit(agentBooking.size).getRawMany<{
            id: number
            memerId: number
            orderTypeId: number
            bookingNumber: string
            customerName: string
            passportNo: string
            email: string
            bookingStatus: number
            social?: string
            phone?: string
            branchFromId?: number
            branchFromTypeId?: number
            branchFromplaceId?: string
            branchToId?: number
            branchToTypeId?: number
            branchToplaceId?: string
            agentId: number
            flightNo?: string
            branchFromName?: string
            branchTomName?: string
            coordinatesFrom?: string
            coordinatesTo?: string
            remark?: string
            dropoffDatetime?: Date
            pickupDatetime?: Date
        }>()

        this.log.customDebugLog(`orders=${orders}`)

        if (orders.length > 0) {
            const orderIds = orders.map(order => order.id)
            const imgs = await this.imageOrderService.findByOrderId(orderIds)
            const urls: string[] = imgs.map(img => img.url)

            booking = await Promise.all(
                orders.map(async order => {
                    const orderOldSystem = await this.oldSystemService.findBooking(order?.bookingNumber, order?.email)

                    // this.log.customDebugLog(orderOldSystem)

                    const products: BookingLuggage[] =
                        orderOldSystem.data[1]?.size_lug_list.map(product => {
                            let amount = product?.qty_booking
                            if (product?.qty_edit != null && product?.qty_edit > 0) {
                                amount = product?.qty_edit
                            }
                            return {
                                id: product.size_id,
                                amount,
                            }
                        }) ?? []

                    return {
                        id: order.id,
                        bookingNumber: order.bookingNumber,
                        agentBookingNumber: order.agentId.toString(),
                        bookingStatus: BookingStatus[order.bookingStatus],
                        fullName: order.customerName,
                        email: order.email,
                        socialType: this.makeSocial(order.social)?.socialType,
                        socialId: this.makeSocial(order.social)?.socialId,
                        passportNo: order.passportNo,
                        citizenId: '',
                        phone: order.phone,
                        flightNumber: order.flightNo,
                        remark: order.remark,
                        serviceType: ServiceType.DELIVERY,
                        products: products,
                        from: {
                            id: order.branchFromId,
                            type: order.branchFromName,
                            placeId: order.branchFromplaceId,
                            lat: this.makeLatAndLng(order.coordinatesFrom)?.lat,
                            lng: this.makeLatAndLng(order.coordinatesFrom)?.lng,
                            datetime: order.dropoffDatetime,
                        },
                        to: {
                            id: order.branchToId,
                            type: order.branchTomName,
                            placeId: order.branchToplaceId,
                            lat: this.makeLatAndLng(order.coordinatesTo)?.lat,
                            lng: this.makeLatAndLng(order.coordinatesTo)?.lng,

                            datetime: order.pickupDatetime,
                        },
                        imageLuggages: urls,
                        agentId: order.agentId,
                    }
                }),
            )
        }

        return {
            page: agentBooking.page,
            size: agentBooking.size,
            total: total,
            data: booking,
        }
    }

    private findRawQuery(): SelectQueryBuilder<Order> {
        return this.repo
            .createQueryBuilder('book')
            .leftJoinAndSelect(Coordinates, 'ct', 'ct.order_id = book.order_id')
            .leftJoinAndSelect(BranchCondition, 'bd', 'book.branch_condition_id = bd.branch_condition_id')
            .leftJoinAndSelect(Branch, 'bFrom', 'bFrom.branch_id = bd.branch_id_from')
            .leftJoinAndSelect(Branch, 'bTo', 'bTo.branch_id = bd.branch_id_to')
            .leftJoinAndSelect(BranchType, 'bFromType', 'bFromType.branch_type_id =  bFrom.branch_type_id')
            .leftJoinAndSelect(BranchType, 'bToType', 'bToType.branch_type_id =  bTo.branch_type_id')
            .select([
                'book.order_id AS id',
                'book.mem_id AS memberId',
                'book.order_type_id AS orderTypeId',
                'book.order_number AS bookingNumber',
                'book.cus_name AS customerName',
                'book.cus_passport_no AS passportNo',
                'book.cus_email AS email',
                'book.order_status AS bookingStatus',
                'book.cus_sns AS social',
                'book.cus_phone AS phone',
                'bFrom.branch_id AS branchFromId',
                'bFrom.branch_type_id AS branchFromTypeId',
                'ISNULL(ct.place_id_from,bFrom.place_id) AS branchFromplaceId',
                'ct.coordinates_from AS coordinatesFrom',
                'bTo.branch_id AS branchToId',
                'bTo.branch_type_id AS branchToTypeId',
                'ISNULL(ct.place_id_to,bTo.place_id) AS branchToplaceId',
                'ct.coordinates_to AS coordinatesTo',
                'book.agent_id AS agentId',
                'flight_no AS flightNo',
                'bFromType.name AS branchFromName',
                'bToType.name AS branchTomName',
                'book.remark AS remark',
                'book.dropoff_datetime AS dropoffDatetime',
                'book.pickup_datetime AS pickupDatetime',
            ])
    }

    public async bookingPermission(@Request() req: Req, data: Booking[] | Booking): Promise<boolean> {
        const authorization = req.headers['authorization']
        const token = await this.authService.authAgent(authorization)
        const agent = await this.agentService.findOneByAgentName(token)

        if (agent == null) return false

        if (Array.isArray(data)) {
            const bookings = data as Booking[]

            if (bookings.some(item => item.agentId == agent.agent_id)) {
                return true
            } else {
                return false
            }
        }

        const booking = data as Booking

        if (booking.agentId == agent.agent_id) return true
        return false
    }

    public async createBooking(dto: CreateBookingsDto, req: Req): Promise<FormatCreateBooking<ResponseBookingDetail>> {
        const { from, to } = dto
        let payload: OldSystemBookingProps = null
        let areaFrom: string = ''
        let areaTo: string = ''
        let uploadImg = true
        const result: FormatCreateBooking<ResponseBookingDetail> = {
            status: DefaultStatus.FAIL,
            data: null,
        }
        let phoneNumber: string = null
        let getBranchCondition: FormatBranchTypeCondition = null
        const fromLagLng = mappingLatlng(from.lat, from.lng)
        const toLagLng = mappingLatlng(to.lat, to.lng)
        let coordinateTo: string = ''
        let coordinateFrom: string = ''

        if (fromLagLng != null) {
            coordinateFrom = fromLagLng.split('@')[1]
        }

        if (toLagLng != null) {
            coordinateTo = toLagLng.split('@')[1]
        }

        const authorization = req.headers['authorization']
        const token = await this.authService.authAgent(authorization)
        const agent = await this.agentService.findOneByAgentName(token)

        // 2323 = Goodlugg
        if (agent == null || agent.agent_id != 2324) {
            result.status = DefaultStatus.UNAUTHORIZED
            return result
        }

        const formatBranchTransform: BranchTransformInterface = {
            from: {
                branchId: from.id,
                latLng: fromLagLng,
            },
            to: {
                branchId: to.id,
                latLng: toLagLng,
            },
        }

        const branchTransform = getBranchTransformType<BranchTransformInterface>(formatBranchTransform)

        this.log.customDebugLog(`branchTransform = ${branchTransform}`)

        if (branchTransform == BranchTransform.FAIL) {
            result.status = DefaultStatus.FAIL
            return result
        }

        if (branchTransform == BranchTransform.BRANCHID_TO_BRANCHID) {
            const fromBranch = await this.branchService.findOneBranchCustom({ branchId: from.id })
            const toBranch = await this.branchService.findOneBranchCustom({ branchId: to.id })

            if (fromBranch.status != DefaultStatus.SUCCESS || toBranch.status != DefaultStatus.SUCCESS) {
                result.status = fromBranch.data == null ? fromBranch.status : toBranch.status
                return result
            }

            getBranchCondition = await this.branchService.findOneBranchTypeCondition(from.id, to.id)
        } else if (branchTransform == BranchTransform.BRANCHID_TO_LATLNG) {
            const fromBranch = await this.branchService.findOneBranchCustom({ branchId: from.id })
            const toBranch = await this.branchService.findOneBranchCustom({
                lat: to.lat.toString(),
                lng: to.lng.toString(),
                placeId: to.placeId,
            })

            if (fromBranch.status != DefaultStatus.SUCCESS || toBranch.status != DefaultStatus.SUCCESS) {
                result.status = fromBranch.data == null ? fromBranch.status : toBranch.status
                return result
            }

            getBranchCondition = await this.branchService.findOneBranchTypeCondition(from.id, toBranch?.data?.id)
            areaTo = toBranch?.data?.area
        } else if (branchTransform == BranchTransform.LATLNG_TO_BRANCHID) {
            const fromBranch = await this.branchService.findOneBranchCustom({
                lat: from.lat.toString(),
                lng: from.lng.toString(),
                placeId: from.placeId,
            })
            const toBranch = await this.branchService.findOneBranchCustom({ branchId: to.id })

            if (fromBranch.status != DefaultStatus.SUCCESS || toBranch.status != DefaultStatus.SUCCESS) {
                result.status = fromBranch.data == null ? fromBranch.status : toBranch.status
                return result
            }

            getBranchCondition = await this.branchService.findOneBranchTypeCondition(fromBranch?.data?.id, to.id)
            areaFrom = fromBranch?.data?.area
        } else if (branchTransform == BranchTransform.LATLNG_TO_LATLNG) {
            const fromBranch = await this.branchService.findOneBranchCustom({
                lat: from.lat.toString(),
                lng: from.lng.toString(),
                placeId: from.placeId,
            })
            const toBranch = await this.branchService.findOneBranchCustom({
                lat: to.lat.toString(),
                lng: to.lng.toString(),
                placeId: to.placeId,
            })

            if (fromBranch.status != DefaultStatus.SUCCESS || toBranch.status != DefaultStatus.SUCCESS) {
                result.status = fromBranch.data == null ? fromBranch.status : toBranch.status
                return result
            }

            getBranchCondition = await this.branchService.findOneBranchTypeCondition(
                fromBranch?.data?.id,
                toBranch?.data?.id,
            )

            areaFrom = fromBranch?.data?.area
            areaTo = toBranch?.data?.area
        }

        if (getBranchCondition == null) {
            result.status = DefaultStatus.BRANCH_CONDITION_NOTFOUND
            return result
        }

        if (dto.phone != null && dto.countryCode != null) {
            phoneNumber = `+${dto.countryCode} - ${dto.phone}`
        }

        payload = {
            ref_id: dto.agentBookingNumber,
            cus_email: dto.email,
            cus_name: dto.fullName,
            cus_phone: phoneNumber,
            cus_passport: dto.passport,
            cus_social: this.makeOldSystemSocial(dto.socialType, dto.socialId),
            remark: dto.remark,
            img_1: dto?.imageLuggages[0] ?? '',
            img_2: dto?.imageLuggages[1] ?? '',
            img_3: dto?.imageLuggages[2] ?? '',
            from_type: getBranchCondition.fromBranchTypeName,
            to_type: getBranchCondition.toBranchTypeName,
            drop_location: getBranchCondition.fromBranchName,
            pickup_location: getBranchCondition.toBranchName,
            drop_datetime: this.makeDateTimeOldSystem(dto.from.dateTime),
            pickup_datetime: this.makeDateTimeOldSystem(dto.to.dateTime),
            flight_datetime: '',
            express: 0, // this field mean delivery express
            deluxe: 0,
            cb_premium: 0,
            is_insurance_on: 0,
            is_subscribe: 0, // for middleware force not subscribe
            lugList: this.makeOldSystemLuggage(dto.products), // pattern sizeId,amount
            fl: dto.flightNumber,
            nationality: dto.customerCountry,
            branch_condition_id: getBranchCondition.branchConditionId.toString(),
            place_id_from: dto.from.placeId ?? '',
            place_id_to: dto.to.placeId ?? '',
            agent: agent.agent_id.toString(),
            branch_id: getBranchCondition.fromBranchId.toString(),
            coordinate_to: coordinateTo,
            coordinate_from: coordinateFrom,
            area_to: areaTo,
            area_from: areaFrom,
            currency_code: 'THB',
            create_by: agent.agent_name,
        }

        if (dto.imageLuggages != null && dto.imageLuggages.length > 0) {
            for (const img of dto.imageLuggages ?? []) {
                const sizeInKb = calculateImgSizeInKb(img)
                const sizeInMb = sizeInKb / 1000

                if (sizeInMb > this.configService.limitImgSizeInMb) {
                    uploadImg = false
                    break
                }
            }
        }

        if (uploadImg == false) {
            result.status = DefaultStatus.IMAGETOOLARGE
            return result
        }

        const createBooking = await this.oldSystemService.createOrder(payload)

        if (createBooking == null || !createBooking?.status) {
            result.status = DefaultStatus.FAIL
        }

        const order = await this.repo.findOne({ where: { order_number: createBooking?.data?.order_number } })
        result.status = DefaultStatus.SUCCESS
        result.data = {
            id: order?.order_id,
            agentBookingNumber: order?.ref_id,
            bookingNumber: order?.order_number,
        }

        return result
    }

    private makeDateTimeOldSystem(date: string): string {
        const formatDate = DateTime.fromISO(date)
        const formatTime = formatDate.toLocaleString({ timeStyle: 'short' })
        const formatDateTime = `${formatDate.day} ${formatDate.month} ${formatDate.year} - ${formatTime}`
        return formatDateTime
    }

    public async updateBookingId(
        req: Req,
        bookingId: number,
        updateBooking: UpdateBookingDto,
    ): Promise<FormatResultService<ResponseBookingDetail>> {
        const result: FormatResultService<ResponseBookingDetail> = {
            status: DefaultStatus.FAIL,
            data: null,
        }

        if (updateBooking?.products?.filter(item => item.amount == 0).length > 0) {
            result.status = DefaultStatus.UPDATE_LUGGAGES_FAILED
            return result
        }

        const authAgent = await this.agentService.getAgentByToken(req)
        const booking = await this.repo.findOne({ where: { order_id: bookingId } })

        if (booking == null) {
            result.status = DefaultStatus.BOOKING_NOTFOUND
            return result
        }

        if (authAgent.agent_id != booking.agent_id) {
            result.status = DefaultStatus.UNAUTHORIZED
            return result
        }

        if (booking.track_status >= TrackStatus.Process) {
            result.status = DefaultStatus.CANNOT_UPDATE_LUGGAGES
            return result
        }

        const Luggages = this.makeOldSystemLuggage(updateBooking.products)
        const updateLuggages = await this.luggageService.updateLuggages(booking.order_number, Luggages)
        const updateImgLuggages = await this.luggageService.updateImg(booking.order_id, updateBooking.imageLuggages, 0)

        if (updateLuggages != DefaultStatus.SUCCESS) {
            result.status = updateLuggages
            return result
        }

        if (updateImgLuggages != DefaultStatus.SUCCESS) {
            result.status = updateImgLuggages
            return result
        }

        result.status = DefaultStatus.SUCCESS
        result.data = {
            id: booking.order_id,
            bookingNumber: booking.order_number,
            agentBookingNumber: booking.ref_id,
        }

        return result
    }

    public async cancelBooking(req: Req, bookingId: number): Promise<FormatCreateBooking<any>> {
        let bookingStatus: BookingStatus = null
        const result: FormatCreateBooking<any> = {
            status: DefaultStatus.FAIL,
            data: null,
        }

        const authAgent = await this.agentService.getAgentByToken(req)
        const booking = await this.repo.findOne({ where: { order_id: bookingId } })

        if (booking == null) {
            result.status = DefaultStatus.BOOKING_NOTFOUND
            return result
        }

        if (authAgent.agent_id != booking.agent_id) {
            result.status = DefaultStatus.UNAUTHORIZED
            return result
        }

        const fromDateUtc = DateTime.fromJSDate(booking.dropoff_datetime)
        const limitDateTimeRefund = makeTimeLocal(fromDateUtc.year, fromDateUtc.month, fromDateUtc.day, 7, 0, 0)
        const current = DateTime.local()

        this.log.customDebugLog(`current = ${current.toISO()}`)
        this.log.customDebugLog(`limitDateTimeRefund = ${limitDateTimeRefund.toISO()}`)

        if (current.toISO() < limitDateTimeRefund.toISO()) {
            this.log.customDebugLog(`Refund`)
            bookingStatus = BookingStatus['Refunds Cancel Customer Not Paid']
        } else {
            this.log.customDebugLog(`not Refund`)
            bookingStatus = BookingStatus['Cancel Customer Paid']
        }

        const updateBooking = this.repo.create({
            ...booking,
            order_status: bookingStatus,
            update_by: authAgent.agent_name,
            update_date: current.toISO(),
        })
        const cancealBooking = await this.repo.save(updateBooking)

        if (cancealBooking == null) {
            result.status = DefaultStatus.CANCEL_BOOKING_FAILED
            return result
        }

        result.status = DefaultStatus.SUCCESS
        result.data = {}

        return result
    }
}
