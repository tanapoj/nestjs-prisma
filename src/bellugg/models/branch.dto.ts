import { IsNotEmpty, IsEnum } from 'class-validator'
import { AvailableBranch, ServiceType } from '../interfaces'
import { PaginationDto } from './pagination.dto'

export class BranchAvailableDto extends PaginationDto {
    @IsEnum(ServiceType)
    @IsNotEmpty()
    serviceType: ServiceType

    @IsEnum(AvailableBranch)
    @IsNotEmpty()
    locationType: AvailableBranch
}
