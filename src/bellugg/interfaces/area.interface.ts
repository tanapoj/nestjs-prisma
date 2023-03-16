export interface VerifyAreaFormat {
    from: VerifyArea
    to: VerifyArea
}

export interface VerifyArea {
    type: string
    id?: number
    lat?: string
    lng?: string
    placeId?: string
}
