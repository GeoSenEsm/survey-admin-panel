import { ChartDataPointDto } from "./chart.data.point.dto"

export interface HistogramDataDto {
    title: string
    series: ChartDataPointDto[]
}