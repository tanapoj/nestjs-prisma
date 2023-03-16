import {
    IsNotEmpty,
    IsEnum,
    IsString,
    IsNumber,
    IsOptional,
    IsObject,
    IsDefined,
    IsNotEmptyObject,
    ValidateNested,
} from 'class-validator'
import { ServiceType, LocationType } from '../interfaces'
import { Transform, Type } from 'class-transformer'
import { toNumber } from '../../common'

export class TimeSlotParamsDto {
    @IsString()
    @IsOptional()
    date: string

    @IsString()
    @IsOptional()
    time?: string

    @Transform(({ value }) => toNumber(value))
    @IsNumber()
    @IsOptional()
    branchId?: number

    @IsString()
    @IsOptional()
    latLng?: string

    @IsString()
    @IsOptional()
    placeId?: string
}

export class TimeSlotDto {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => TimeSlotParamsDto)
    from: TimeSlotParamsDto

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => TimeSlotParamsDto)
    to: TimeSlotParamsDto
}

export class TimeSlotQueryDto {
    @IsEnum(ServiceType)
    @IsNotEmpty()
    serviceType: ServiceType

    @IsEnum(LocationType)
    @IsNotEmpty()
    locationType: LocationType
}
