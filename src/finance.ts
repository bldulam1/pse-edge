import axios from 'axios'
import { parse, HTMLElement } from 'node-html-parser'
import { stockLoader } from './directory'

/**
 * Gets financial reports of a ticker symbol from PSE Edge.
 * @param sym Ticker Symbol (e.g. GLO, TEL, ALI)
 * @returns PseFinancial
 */
export const getFinancialReports = async (sym: string) => {
  const stock = await stockLoader.load(sym)
  if (stock?.companyId) {
    return axios
      .get(`https://edge.pse.com.ph/companyPage/financial_reports_view.do?cmpy_id=${stock.companyId}`)
      .then((v) => parse(v.data))
      .then((html) => {
        const [bs1y, is1y, bs1q, is1q] = html.querySelectorAll('table')

        const bs1yRows = getTable(bs1y)
        const bs1qRows = getTable(bs1q)
        const is1yrows = getTable(is1y)
        const is1qrows = getTable(is1q)

        return {
          annual: {
            balanceSheet: {
              CurrentYear: getBalanceSheet(0, bs1yRows),
              PreviousYear: getBalanceSheet(1, bs1yRows),
            },
            incomeStatement: {
              CurrentYear: getIncomeStatement(0, is1yrows),
              PreviousYear: getIncomeStatement(1, is1yrows),
            },
          },
          quarterly: {
            balanceSheet: {
              CurrentYear: getBalanceSheet(0, bs1qRows),
              PreviousYear: getBalanceSheet(1, bs1qRows),
            },
            incomeStatement: {
              CurrentYear: getIncomeStatement(0, is1qrows),
              PreviousYear: getIncomeStatement(1, is1qrows),
              CurrentYearToDate: getIncomeStatement(2, is1qrows),
              PreviousYearToDate: getIncomeStatement(3, is1qrows),
            },
          },
        } as PseFinancial
      })
  }

  throw new Error(`${sym} not found`)
}

const getTable = (w: HTMLElement) => {
  return w.querySelectorAll('tr').map((tr) => tr.querySelectorAll('td').map((v) => toNumber(v.innerText)))
}

const getIncomeStatement = (col: number, rows: (number | undefined)[][]) => {
  const [
    GrossRevenue,
    GrossExpense,
    IncomeBeforeTax,
    NetIncomeAfterTax,
    NetIncomeAttributableToParent,
    EarningsPerShareBasic,
    EarningsPerShareDiluted,
  ] = rows.map((row) => row[col])
  return {
    GrossRevenue,
    GrossExpense,
    IncomeBeforeTax,
    NetIncomeAfterTax,
    NetIncomeAttributableToParent,
    EarningsPerShareBasic,
    EarningsPerShareDiluted,
  } as IncomeStatement
}

const getBalanceSheet = (col: number, rows: (number | undefined)[][]) => {
  const [
    GrossRevenue,
    GrossExpense,
    IncomeBeforeTax,
    NetIncomeAfterTax,
    NetIncomeAttributableToParent,
    EarningsPerShareBasic,
    EarningsPerShareDiluted,
  ] = rows.map((row) => row[col])
  return {
    GrossRevenue,
    GrossExpense,
    IncomeBeforeTax,
    NetIncomeAfterTax,
    NetIncomeAttributableToParent,
    EarningsPerShareBasic,
    EarningsPerShareDiluted,
  } as BalanceSheet
}

interface BalanceSheet {
  CurrentAssets?: number
  TotalAssets?: number
  CurrentLiabilities?: number
  TotalLiabilities?: number
  RetainedEarningsDeficit?: number
  StockholdersEquity?: number
  StockholdersEquityParent?: number
  BookValuePerShare?: number
}

interface IncomeStatement {
  GrossRevenue?: number
  GrossExpense?: number
  IncomeBeforeTax?: number
  NetIncomeAfterTax?: number
  NetIncomeAttributableToParent?: number
  EarningsPerShareBasic?: number
  EarningsPerShareDiluted?: number
}

interface PseFinancial {
  annual: {
    balanceSheet: {
      CurrentYear: BalanceSheet
      PreviousYear: BalanceSheet
    }
    incomeStatement: {
      CurrentYear: IncomeStatement
      PreviousYear: IncomeStatement
    }
  }
  quarterly: {
    balanceSheet: {
      CurrentYear: BalanceSheet
      PreviousYear: BalanceSheet
    }
    incomeStatement: {
      CurrentYear: IncomeStatement
      PreviousYear: IncomeStatement
      CurrentYearToDate: IncomeStatement
      PreviousYearToDate: IncomeStatement
    }
  }
}

const toNumber = (v?: string) => {
  if (v) {
    if (/\(|\)/.test(v)) {
      // negative
      return -parseFloat(v.replace(/\(|\)|\,|\s/g, ''))
    }
    return parseFloat(v.replace(/\(|\)|\,|\s/g, ''))
  }
}
