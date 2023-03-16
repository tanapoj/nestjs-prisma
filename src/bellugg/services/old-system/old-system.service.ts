import { Inject, Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import * as FormData from 'form-data'
import { lastValueFrom } from 'rxjs'
import { Log } from '../../../logs'
import { ConfigService } from 'src/config'
import { SupportArea, OldSystemBookingProps, ProductBookingProps } from '../../interfaces'
import { UploadImgDto } from '../../models'

@Injectable()
export class OldSystemService {
    constructor(
        private readonly httpService: HttpService,
        private log: Log,
        @Inject('ConfigService') private configService: ConfigService,
    ) {}

    public async findBooking(order_number: string, email: string): Promise<any> {
        this.log.customDebugLog('start oldSystemfindOneByOrderNumber')
        this.log.customDebugLog(`order_number = ${order_number}`)
        this.log.customDebugLog(`email = ${email}`)

        if (order_number == null || email == null) return

        const json = JSON.stringify({
            order_number: order_number,
            email: email,
        })

        this.log.customDebugLog(`json = ${json}`)

        const data = new FormData()
        data.append('dataJsonString', json)

        this.log.customDebugLog(data.getHeaders())

        this.log.customDebugLog('test')

        try {
            const res = await lastValueFrom(
                this.httpService.get(`${this.configService.oldSystemUrl}/Booking/getTrackingStatus`, {
                    headers: {
                        ...data.getHeaders(),
                    },
                    data: data,
                }),
            )

            this.log.customDebugLog(res?.data)

            return res?.data
        } catch (error) {
            return
        }
    }

    public async findSupportArea(query: SupportArea): Promise<any> {
        const { lat, lng, placeId } = query ?? {}
        this.log.customDebugLog('start oldSystemfindOneByOrderNumber')
        this.log.customDebugLog(`lat = ${lat}`)
        this.log.customDebugLog(`lng = ${lng}`)

        if (lat != null || lng != null) {
            const data = new FormData()
            data.append('lat', lat)
            data.append('lng', lng)

            if (placeId != null) {
                data.append('place_id', placeId)
            }

            this.log.customDebugLog(data.getHeaders())

            try {
                const res = await lastValueFrom(
                    this.httpService.post(`${this.configService.oldSystemUrl}/Booking/CheckSupportArea`, data, {
                        headers: {
                            ...data.getHeaders(),
                        },
                    }),
                )

                this.log.customDebugLog(`data = ${JSON.stringify(res?.data)}`)

                return res?.data
            } catch (error) {
                return
            }
        }
    }

    public async createOrder(data: OldSystemBookingProps): Promise<any> {
        const json = JSON.stringify(data)

        const param = {
            dataInput: json,
        }

        try {
            const res = await lastValueFrom(
                this.httpService.post(`${this.configService.oldSystemUrl}/Booking/SaveLuggageDelivery`, param),
            )

            this.log.customDebugLog(`data = ${JSON.stringify(res?.data)}`)

            return res?.data
        } catch (error) {
            this.log.customErrorLog(error)
            return
        }
    }

    public async updateLuggages(bookingNumber: string, productList: string[]): Promise<any> {
        const formData = new FormData()
        formData.append('order_number', bookingNumber)

        if (productList?.length > 0) {
            productList.forEach(item => {
                formData.append('lugg_arr[]', item)
            })
        }

        try {
            const res = await lastValueFrom(
                this.httpService.post(`${this.configService.oldSystemUrl}/Booking/SaveLuggage`, formData, {
                    headers: {
                        ...formData.getHeaders(),
                    },
                }),
            )

            this.log.customDebugLog(`data = ${JSON.stringify(res?.data)}`)

            return res?.data
        } catch (error) {
            this.log.customErrorLog(error)
            return
        }
    }

    public async uploadImgLuggages(bookingId: number, productList: UploadImgDto, imgTypeId: number): Promise<any> {
        const formData = new FormData()
        const bookingNumberJson = JSON.stringify({
            image: productList?.base64,
            im_id: productList?.imageId ?? -1,
            image_type_id: imgTypeId,
            order_id: bookingId,
        })

        formData.append('dataJsonString', bookingNumberJson)

        try {
            const res = await lastValueFrom(
                this.httpService.post(`${this.configService.oldSystemUrl}/Booking/UploadPictureLuggage`, formData, {
                    headers: {
                        ...formData.getHeaders(),
                    },
                }),
            )

            this.log.customDebugLog(`data = ${JSON.stringify(res?.data)}`)

            return res?.data
        } catch (error) {
            this.log.customErrorLog(error)
            return
        }
    }
}
