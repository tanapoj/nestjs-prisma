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

export class AreaParamsDto {
    @IsString()
    @IsNotEmpty()
    type: string

    @Transform(({ value }) => toNumber(value))
    @IsNumber()
    @IsOptional()
    id?: number

    @IsString()
    @IsOptional()
    dateTime?: string

    @IsString()
    @IsOptional()
    lat?: string

    @IsString()
    @IsOptional()
    lng?: string

    @IsString()
    @IsOptional()
    placeId?: string
}

export class AreaDto {
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => AreaParamsDto)
    from: AreaParamsDto

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => AreaParamsDto)
    to: AreaParamsDto
}
