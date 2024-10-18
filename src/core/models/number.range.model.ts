export interface NumberRangeModel {
    from: number,
    to: number,
    fromLabel?: string,
    toLabel?: string
}

export function getDefaultNumberRange(): NumberRangeModel {
    return {
        from: 1,
        to: 5
    }
}