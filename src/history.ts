import { format } from 'date-fns'
import { httpClient, wrapHttpError } from './http-client'
import { validateSymbol } from './common'
import { stockLoader } from './directory'
import { HistoricalPrice } from './types'

const PSE_CHART_URL = 'https://edge.pse.com.ph/common/DisclosureCht.ax'

interface RawOHLC {
  OPEN: number
  VALUE: number
  CLOSE: number
  CHART_DATE: string
  HIGH: number
  LOW: number
}

/**
 * Validates and normalizes a date input to a Date object.
 */
const parseDate = (value: string | number | Date, label: string): Date => {
  const date = new Date(value)
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ${label}: "${value}"`)
  }
  return date
}

/**
 * Gets historical prices (OHLC data) of a ticker symbol from PSE Edge.
 * @param props.symbol Ticker symbol (e.g. GLO, TEL, ALI)
 * @param props.startDate Start date for the range
 * @param props.endDate Optional end date (defaults to today)
 * @returns Array of HistoricalPrice objects with OHLC + date + value
 */
export const getHistoricalPrices = async (props: {
  symbol: string
  startDate: string | number | Date
  endDate?: string | number | Date
}): Promise<HistoricalPrice[]> => {
  const symbol = validateSymbol(props.symbol)
  const stock = await stockLoader.load(symbol)

  if (!stock) {
    throw new Error(`Symbol "${symbol}" not found`)
  }

  const startDate = parseDate(props.startDate, 'startDate')
  const endDate = props.endDate ? parseDate(props.endDate, 'endDate') : new Date()

  try {
    const response = await httpClient.post(PSE_CHART_URL, {
      cmpy_id: stock.companyId,
      security_id: stock.securityId,
      startDate: format(startDate, 'MM-dd-yyyy'),
      endDate: format(endDate, 'MM-dd-yyyy'),
    })

    const chartData = response.data?.chartData as RawOHLC[] | undefined
    if (!chartData) return []

    return chartData.map((w) => ({
      o: w.OPEN,
      h: w.HIGH,
      l: w.LOW,
      c: w.CLOSE,
      t: format(new Date(w.CHART_DATE), 'yyyy-MM-dd'),
      value: w.VALUE,
    }))
  } catch (error) {
    wrapHttpError(error, `Failed to fetch historical prices for ${symbol}`)
  }
}
