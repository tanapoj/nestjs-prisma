export enum BranchTransform {
    'BRANCHID_TO_BRANCHID' = 'branchIdTobranchId',
    'BRANCHID_TO_LATLNG' = 'branchIdTolatLng',
    'LATLNG_TO_BRANCHID' = 'latLngTobranchId',
    'LATLNG_TO_LATLNG' = 'latLngTolatLng',
    'FAIL' = 'fail',
}

export interface BranchTransformInterface {
    from: { branchId?: number; latLng?: string }
    to: { branchId?: number; latLng?: string }
}

export function mappingLatlng(lat?: string | number, lng?: string | number): string {
    if (lat == null || lat == '' || lng == null || lng == '') return
    return `@${lat},${lng}`
}

export function getBranchTransformType<T extends BranchTransformInterface>(dto: T): BranchTransform {
    let result: BranchTransform = null

    if (dto.from.branchId != null && dto.to.branchId != null) {
        result = BranchTransform.BRANCHID_TO_BRANCHID
    } else if (dto.from.branchId != null && dto.to.latLng != null) {
        result = BranchTransform.BRANCHID_TO_LATLNG
    } else if (dto.from.latLng != null && dto.to.branchId != null) {
        result = BranchTransform.LATLNG_TO_BRANCHID
    } else if (dto.from.latLng != null && dto.to.latLng != null) {
        result = BranchTransform.LATLNG_TO_LATLNG
    } else {
        result = BranchTransform.FAIL
    }

    return result
}
