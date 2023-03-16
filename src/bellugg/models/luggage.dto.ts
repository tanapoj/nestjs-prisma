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

export class LuggageSizeParamsDto {
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

export class LuggageSizeDto {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => LuggageSizeParamsDto)
    from: LuggageSizeParamsDto

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => LuggageSizeParamsDto)
    to: LuggageSizeParamsDto
}
