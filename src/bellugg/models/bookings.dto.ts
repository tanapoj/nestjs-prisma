import {
    IsString,
    IsOptional,
    IsNotEmpty,
    ArrayNotEmpty,
    IsDefined,
    IsNotEmptyObject,
    IsObject,
    ValidateNested,
    IsNumber,
    IsArray,
    ArrayMaxSize,
} from 'class-validator'
import { PaginationDto } from './pagination.dto'
import { BookingProps, BranchBookingProps } from '../interfaces'
import { Transform, Type } from 'class-transformer'
import { toNumber, toFloat } from '../../common'

export class BookingsDto extends PaginationDto {
    @IsString()
    @IsOptional()
    bookingNumber?: string

    @IsString()
    @IsOptional()
    agentBookingNumber?: string
}

export class BranchBookingDto {
    @IsString()
    @IsNotEmpty()
    type: string

    @Transform(({ value }) => toNumber(value))
    @IsNumber()
    @IsOptional()
    id?: number

    @Transform(({ value }) => toFloat(value))
    @IsNumber()
    @IsOptional()
    lat?: number

    @Transform(({ value }) => toFloat(value))
    @IsNumber()
    @IsOptional()
    lng?: number

    @IsString()
    @IsOptional()
    placeId?: string

    @IsString()
    @IsNotEmpty()
    dateTime: string
}

export class ProductBookingDto {
    @Transform(({ value }) => toNumber(value))
    @IsNumber()
    @IsNotEmpty()
    id: number

    @Transform(({ value }) => toNumber(value))
    @IsNumber()
    @IsNotEmpty()
    amount: number
}

export class CreateBookingsDto implements BookingProps {
    @IsString()
    @IsNotEmpty()
    agentBookingNumber: string

    @IsString()
    @IsNotEmpty()
    fullName: string

    @IsString()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsOptional()
    socialType?: string

    @IsString()
    @IsOptional()
    socialId?: string

    @IsString()
    @IsOptional()
    passport?: string

    @IsString()
    @IsOptional()
    countryCode?: string

    @IsString()
    @IsOptional()
    phone?: string

    @IsString()
    @IsOptional()
    customerCountry?: string

    @IsString()
    @IsOptional()
    flightNumber?: string

    @IsString()
    @IsOptional()
    remark?: string

    @IsString()
    @IsOptional()
    serviceType?: string

    @ArrayNotEmpty()
    @Type(() => ProductBookingDto)
    products: ProductBookingDto[]

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => BranchBookingDto)
    from: BranchBookingDto

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => BranchBookingDto)
    to: BranchBookingProps

    @ArrayMaxSize(3, { message: 'limit 3 images' })
    @IsArray()
    @IsOptional()
    imageLuggages: string[]
}

export class UploadImgDto {
    @Transform(({ value }) => toNumber(value))
    @IsNumber()
    @IsOptional()
    imageId?: number

    @IsString()
    @IsOptional()
    base64?: string
}

export class UpdateBookingDto {
    @ArrayNotEmpty()
    @Type(() => ProductBookingDto)
    products: ProductBookingDto[]

    @ArrayMaxSize(3, { message: 'limit 3 images' })
    @ArrayNotEmpty()
    @Type(() => UploadImgDto)
    imageLuggages: UploadImgDto[]
}
