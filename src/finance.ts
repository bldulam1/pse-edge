import { parse, HTMLElement } from 'node-html-parser'
import { httpClient, wrapHttpError } from './http-client'
import { validateSymbol } from './common'
import { stockLoader } from './directory'
import { BalanceSheet, IncomeStatement, PseFinancial } from './types'

const PSE_FINANCIAL_URL = 'https://edge.pse.com.ph/companyPage/financial_reports_view.do'

/**
 * Parses a financial number from PSE format.
 * Handles parenthesized negatives, commas, and whitespace.
 * Returns undefined for empty/invalid values.
 */
const toNumber = (v?: string): number | undefined => {
  if (!v || !v.trim()) return undefined

  const isNegative = /\(|\)/.test(v)
  const cleaned = v.replace(/[(),\s]/g, '')
  const parsed = parseFloat(cleaned)

  if (isNaN(parsed)) return undefined
  return isNegative ? -parsed : parsed
}

/**
 * Extracts a 2D array of numbers from an HTML table.
 */
const parseTableRows = (table: HTMLElement): (number | undefined)[][] => {
  return table
    .querySelectorAll('tr')
    .map((tr) => tr.querySelectorAll('td').map((td) => toNumber(td.innerText)))
}

/**
 * Extracts a column value from row data by column index.
 */
const getColumnValue = (rows: (number | undefined)[][], col: number, row: number): number | undefined => {
  return rows[row]?.[col]
}

/**
 * Builds an IncomeStatement from table data at the given column index.
 */
const buildIncomeStatement = (col: number, rows: (number | undefined)[][]): IncomeStatement => ({
  GrossRevenue: getColumnValue(rows, col, 0),
  GrossExpense: getColumnValue(rows, col, 1),
  IncomeBeforeTax: getColumnValue(rows, col, 2),
  NetIncomeAfterTax: getColumnValue(rows, col, 3),
  NetIncomeAttributableToParent: getColumnValue(rows, col, 4),
  EarningsPerShareBasic: getColumnValue(rows, col, 5),
  EarningsPerShareDiluted: getColumnValue(rows, col, 6),
})

/**
 * Builds a BalanceSheet from table data at the given column index.
 * Row order must match the PSE financial reports HTML structure.
 */
const buildBalanceSheet = (col: number, rows: (number | undefined)[][]): BalanceSheet => ({
  CurrentAssets: getColumnValue(rows, col, 0),
  TotalAssets: getColumnValue(rows, col, 1),
  CurrentLiabilities: getColumnValue(rows, col, 2),
  TotalLiabilities: getColumnValue(rows, col, 3),
  RetainedEarningsDeficit: getColumnValue(rows, col, 4),
  StockholdersEquity: getColumnValue(rows, col, 5),
  StockholdersEquityParent: getColumnValue(rows, col, 6),
  BookValuePerShare: getColumnValue(rows, col, 7),
})

/**
 * Gets financial reports of a ticker symbol from PSE Edge.
 * @param sym Ticker Symbol (e.g. GLO, TEL, ALI)
 * @returns PseFinancial with annual and quarterly data
 */
export const getFinancialReports = async (sym: string): Promise<PseFinancial> => {
  const symbol = validateSymbol(sym)
  const stock = await stockLoader.load(symbol)

  if (!stock?.companyId) {
    throw new Error(`Symbol "${symbol}" not found`)
  }

  try {
    const response = await httpClient.get(PSE_FINANCIAL_URL, {
      params: { cmpy_id: stock.companyId },
    })

    const html = parse(response.data)
    const tables = html.querySelectorAll('table')

    if (tables.length < 4) {
      throw new Error('Unexpected financial reports page structure')
    }

    const [balanceSheetAnnual, incomeStatementAnnual, balanceSheetQuarterly, incomeStatementQuarterly] = tables

    const bsAnnualRows = parseTableRows(balanceSheetAnnual)
    const isAnnualRows = parseTableRows(incomeStatementAnnual)
    const bsQuarterlyRows = parseTableRows(balanceSheetQuarterly)
    const isQuarterlyRows = parseTableRows(incomeStatementQuarterly)

    return {
      annual: {
        balanceSheet: {
          CurrentYear: buildBalanceSheet(0, bsAnnualRows),
          PreviousYear: buildBalanceSheet(1, bsAnnualRows),
        },
        incomeStatement: {
          CurrentYear: buildIncomeStatement(0, isAnnualRows),
          PreviousYear: buildIncomeStatement(1, isAnnualRows),
        },
      },
      quarterly: {
        balanceSheet: {
          CurrentYear: buildBalanceSheet(0, bsQuarterlyRows),
          PreviousYear: buildBalanceSheet(1, bsQuarterlyRows),
        },
        incomeStatement: {
          CurrentYear: buildIncomeStatement(0, isQuarterlyRows),
          PreviousYear: buildIncomeStatement(1, isQuarterlyRows),
          CurrentYearToDate: buildIncomeStatement(2, isQuarterlyRows),
          PreviousYearToDate: buildIncomeStatement(3, isQuarterlyRows),
        },
      },
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unexpected')) throw error
    wrapHttpError(error, `Failed to fetch financial reports for ${symbol}`)
  }
}
