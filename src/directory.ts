import { parse } from 'node-html-parser'
import DataLoader = require('dataloader')
import { httpClient, wrapHttpError } from './http-client'
import { unEntity } from './common'
import { PseStock } from './types'

const PSE_DIRECTORY_URL = 'https://edge.pse.com.ph/companyDirectory/search.ax'
const MAX_PAGES = 100

/**
 * Fetches a single page of stocks from the PSE directory.
 */
const fetchStocksByPage = async (pageNo: number): Promise<PseStock[]> => {
  try {
    const response = await httpClient.post(PSE_DIRECTORY_URL, null, {
      params: {
        pageNo,
        companyId: '',
        keyword: '',
        sortType: '',
        dateSortType: 'DESC',
        cmpySortType: 'ASC',
        symbolSortType: 'ASC',
        sector: 'ALL',
        subsector: 'ALL',
      },
    })

    const doc = parse(response.data)
    const list = doc.querySelector('.list')
    if (!list) return []

    const rows = list.querySelectorAll('tbody>tr')
    if (!rows || rows.length === 0) return []

    return rows
      .map((node) => {
        const anchor = node.querySelector('a')
        if (!anchor?.rawAttributes?.onclick) return null

        const onclickMatch = anchor.rawAttributes.onclick.split(/\(|\)/)
        if (onclickMatch.length < 2) return null

        const ids = onclickMatch[1].replace(/'/g, '').split(',')
        if (ids.length < 2) return null

        const [companyId, securityId] = ids
        const cells = node.querySelectorAll('td')
        if (cells.length < 5) return null

        const [secName, symbol, sector, subSector, listingDate] = cells.map((v) => v.innerText)

        return {
          securityId,
          companyId,
          secName: unEntity(secName),
          symbol,
          sector,
          subSector: unEntity(subSector),
          listingDate: new Date(listingDate),
        } as PseStock
      })
      .filter((s): s is PseStock => s !== null)
  } catch (error) {
    wrapHttpError(error, `Failed to fetch stock directory page ${pageNo}`)
  }
}

/**
 * Fetches all stocks listed in the Philippine Stock Exchange.
 * Paginates through the PSE directory until all pages are exhausted.
 * @returns Array of PseStock objects
 */
export const fetchStocksAll = async (): Promise<PseStock[]> => {
  const stocks: PseStock[] = []
  let pageNo = 1

  while (pageNo <= MAX_PAGES) {
    const pageStocks = await fetchStocksByPage(pageNo)
    if (pageStocks.length === 0) break

    stocks.push(...pageStocks)
    pageNo++
  }

  return stocks
}

/**
 * DataLoader that batch-loads PseStock objects by ticker symbol.
 * Internally fetches the full stock list once and caches lookups.
 */
export const stockLoader = new DataLoader(async (symbols: readonly string[]) => {
  const stocks = await fetchStocksAll()
  const dict = new Map(stocks.map((s) => [s.symbol.toUpperCase(), s]))
  return symbols.map((s) => dict.get(s.toUpperCase()))
})
