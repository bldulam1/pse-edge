import { parse, HTMLElement } from 'node-html-parser'
import { httpClient, wrapHttpError } from './http-client'
import { validateSymbol } from './common'
import { stockLoader } from './directory'
import { CompanyDisclosure } from './types'

const PSE_DISCLOSURES_URL = 'https://edge.pse.com.ph/companyDisclosures/search.ax'

/**
 * Gets company disclosures of a ticker symbol from PSE Edge.
 * @param sym Ticker Symbol (e.g. GLO, TEL, ALI)
 * @returns Array of CompanyDisclosure objects
 */
export const getCompanyDisclosures = async (sym: string): Promise<CompanyDisclosure[]> => {
  const symbol = validateSymbol(sym)
  const stock = await stockLoader.load(symbol)
  const companyId = stock?.companyId

  if (!companyId) {
    throw new Error(`Symbol "${symbol}" not found`)
  }

  try {
    const response = await httpClient.post(PSE_DISCLOSURES_URL, null, {
      params: { keyword: companyId, tmplNm: '' },
    })

    const html = parse(response.data)
    const table = html.querySelector('table')
    if (!table) return []

    return table
      .querySelectorAll('tr')
      .map((tr) => {
        const cells = tr.querySelectorAll('td')
        if (cells.length < 4) return null

        const link = extractDisclosureLink(tr)
        const [name, date, , id] = cells.map((v) => v.innerText)
        const cleanId = id?.replace(/\s/g, '') || ''

        if (!cleanId) return null

        return { id: cleanId, link, name, date } as CompanyDisclosure
      })
      .filter((v): v is CompanyDisclosure => v !== null)
  } catch (error) {
    wrapHttpError(error, `Failed to fetch disclosures for ${symbol}`)
  }
}

/**
 * Extracts the disclosure viewer link from a table row's onclick handler.
 */
const extractDisclosureLink = (tr: HTMLElement): string | undefined => {
  const anchor = tr.querySelector('a')
  if (!anchor?.attributes?.onclick) return undefined

  const edgeNo = anchor.attributes.onclick
    .split(/openPopup\('|'\);return false;/)
    .find((w: string) => w.length > 0)

  if (!edgeNo) return undefined

  return `https://edge.pse.com.ph/openDiscViewer.do?edge_no=${edgeNo}`
}
