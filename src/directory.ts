import axios from 'axios'
import DataLoader = require('dataloader')
import { parse } from 'node-html-parser'
import { unEntity } from './common'

export interface PseStock {
  companyId: string
  listingDate: Date
  secName: string
  sector: string
  securityId: string
  subSector: string
  symbol: string
}

const fetchStocksByPage = async (pageNo: number) => {
  return axios({
    method: 'POST',
    url: 'https://edge.pse.com.ph/companyDirectory/search.ax',
    data: `pageNo=${pageNo}&companyId=&keyword=&sortType=&dateSortType=DESC&cmpySortType=ASC&symbolSortType=ASC&sector=ALL&subsector=ALL`,
  })
    .then((v) => parse(v.data))
    .then((v) => v.querySelector('.list'))
    .then((v) => v?.querySelectorAll('tbody>tr'))
    .then((nodes) => {
      if (nodes) {
        return nodes.map((node) => {
          const a = node.querySelector('a')
          if (a) {
            const [companyId, securityId] = a.rawAttributes.onclick.split(/\(|\)/)[1].replace(/'/g, '').split(',')
            const [secName, symbol, sector, subSector, listingDate] = node
              .querySelectorAll('td')
              .map((v) => v.innerText)

            return {
              securityId,
              companyId,
              secName: unEntity(secName),
              symbol,
              sector,
              subSector: unEntity(subSector),
              listingDate: new Date(listingDate),
            } as PseStock
          }
        })
      }
      return []
    })
}

/**
 * Fetches all stocks listed in the Philippine Stock Exchange
 * @returns PseStock
 */
export const fetchStocksAll = async () => {
  const stocks: PseStock[] = []
  let pageNo = 1
  while (true) {
    const newStocks = await fetchStocksByPage(pageNo)
    if (newStocks.length <= 1) {
      break
    }

    newStocks.forEach((s) => s && stocks.push(s))
    pageNo++
  }
  return stocks
}

export const stockLoader = new DataLoader(async (symbols: readonly string[]) => {
  const stocks = await fetchStocksAll()
  const dict = new Map(stocks.map((s) => [s.symbol, s]))
  return symbols.map((s) => dict.get(s.toUpperCase()))
})
