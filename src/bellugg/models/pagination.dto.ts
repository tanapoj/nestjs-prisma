import { IsNumber, IsOptional, IsEnum } from 'class-validator'
import { Transform } from 'class-transformer'
import { toNumber } from '../../common'
import { Language } from '../interfaces'

export class PaginationDto {
    @Transform(({ value }) => toNumber(value, { default: 1, min: 1 }))
    @IsNumber()
    @IsOptional()
    page = 1

    @Transform(({ value }) => toNumber(value, { default: 20, max: 1000 }))
    @IsOptional()
    @IsNumber()
    size = 20

    @IsOptional()
    @IsEnum(Language)
    lang = Language.EN
}
