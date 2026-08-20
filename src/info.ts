import { parse } from 'node-html-parser'
import { httpClient, wrapHttpError } from './http-client'
import { camelCase, validateSymbol } from './common'
import { stockLoader } from './directory'
import { StockCompanyInfo } from './types'

const PSE_COMPANY_INFO_URL = 'https://edge.pse.com.ph/companyInformation/form.do'

/**
 * Extracts key-value pairs from an HTML table section identified by a caption regex.
 */
const extractTableSection = (
  html: ReturnType<typeof parse>,
  captionPattern: RegExp,
  props: Record<string, string>,
): void => {
  const caption = html.querySelectorAll('caption').find((w) => captionPattern.test(w.innerText))
  const table = caption?.parentNode
  if (!table) return

  table.querySelectorAll('tr').forEach((tr) => {
    const headerText = tr.querySelector('th')?.innerText.replace(/[^A-Za-z ]/g, '')
    if (!headerText) return

    const key = camelCase(headerText)
    const value = tr.querySelector('td')?.innerText
    if (value !== undefined) {
      props[key] = value
    }
  })
}

/**
 * Gets company information of a ticker symbol from PSE Edge.
 * @param sym Ticker Symbol (e.g. GLO, TEL, ALI)
 * @returns StockCompanyInfo with full company details
 */
export const getCompanyInfo = async (sym: string): Promise<StockCompanyInfo> => {
  const symbol = validateSymbol(sym)
  const stock = await stockLoader.load(symbol)
  const companyId = stock?.companyId

  if (!companyId) {
    throw new Error(`Symbol "${symbol}" not found`)
  }

  try {
    const response = await httpClient.get(PSE_COMPANY_INFO_URL, {
      params: { cmpy_id: companyId },
    })

    const html = parse(response.data)
    const props: Record<string, string> = {}

    // Extract company name and description
    const companyName = html.querySelector('.compInfo > p')?.innerHTML
    const description = html.querySelector('table.view>tr>td')?.innerHTML

    if (companyName) props.companyName = companyName
    if (description) props.description = description

    // Extract security information and contact details from captioned tables
    extractTableSection(html, /security/i, props)
    extractTableSection(html, /contact/i, props)

    // Safely extract fiscal year (may be undefined if not present in HTML)
    const fiscalYearRaw = props.fiscalYear
    const fiscalYear = fiscalYearRaw ? fiscalYearRaw.split('\r\n')[0] : ''

    return {
      companyName: props.companyName || '',
      description: props.description || '',
      sector: props.sector || '',
      subsector: props.subsector || '',
      corporateLife: props.corporateLife || '',
      incorporationDate: props.incorporationDate || '',
      numberOfDirectors: props.numberOfDirectors || '',
      stockholdersMeetingAsPerByLaws: props.stockholdersMeetingAsPerByLaws || '',
      fiscalYear,
      externalAuditor: props.externalAuditor || '',
      transferAgent: props.transferAgent || '',
      businessAddress: props.businessAddress || '',
      emailAddress: props.emailAddress || '',
      telephoneNumber: props.telephoneNumber || '',
      faxNumber: props.faxNumber || '',
      website: props.website || '',
    } as StockCompanyInfo
  } catch (error) {
    wrapHttpError(error, `Failed to fetch company info for ${symbol}`)
  }
}
