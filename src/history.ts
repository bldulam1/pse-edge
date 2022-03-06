import axios from 'axios'
import { format } from 'date-fns'

import { stockLoader } from './directory'

interface TSEOHLC {
  OPEN: number
  VALUE: number
  CLOSE: number
  CHART_DATE: string
  HIGH: number
  LOW: number
}

/**
 * Gets historical prices (OHLC data) of a ticker symbol from PSE Edge.
 */
export const getHistoricalPrices = async (props: {
  symbol: string
  startDate: string | number | Date
  endDate?: string | number | Date
}) => {
  const a = await stockLoader.load(props.symbol.toUpperCase())

  if (a) {
    return axios
      .post('https://edge.pse.com.ph/common/DisclosureCht.ax', {
        cmpy_id: a.companyId,
        security_id: a.securityId,
        startDate: format(new Date(props.startDate), 'MM-dd-yyyy'),
        endDate: format(props.endDate ? new Date(props.endDate) : new Date(), 'MM-dd-yyyy'),
      })
      .then((v) => v.data.chartData as TSEOHLC[])
      .then((v) =>
        v.map((w) => ({
          o: w.OPEN,
          h: w.HIGH,
          l: w.LOW,
          c: w.CLOSE,
          t: format(new Date(w.CHART_DATE), 'yyyy-MM-dd'),
          value: w.VALUE,
        })),
      )
  }

  throw new Error(`${props.symbol} not found`)
}
