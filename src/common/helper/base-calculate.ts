import { DateTime } from 'luxon'

export function calculateImgSizeInKb(base64: string): number {
    const stringLength = base64.length

    const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812
    const sizeInKb = sizeInBytes / 1000

    return sizeInKb
}

export function verifyLatlng(latlng: string): RegExpExecArray {
    const latLngReg = /@([0-9]*(\.[0-9]*)?)\,([0-9]*(\.[0-9]*)?)(([0-9]*(\.[0-9]*)?))?/
    const group = latLngReg.exec(latlng)

    return group
}

export function makeTimeLocal(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    utc = true,
): DateTime {
    const unitUtc = -420
    if (utc) {
        return DateTime.local(year, month, day, hour, minute, second).toUTC(unitUtc)
    }

    return DateTime.local(year, month, day, hour, minute, second)
}
