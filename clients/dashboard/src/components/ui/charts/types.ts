export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'scatter'

export interface ChartSeries {
  name: string
  data: Array<number | { x: string | number | Date; y: number }>
  color?: string
}

export interface ChartPropsBase {
  title?: string
  subtitle?: string
  height?: number
  colors?: string[]
  showLegend?: boolean
  className?: string
}

export interface XYChartProps extends ChartPropsBase {
  series: ChartSeries[]
  xKey: string
  yKeys?: string[]
}

export interface PieChartProps extends ChartPropsBase {
  labels: string[]
  values: number[]
}
