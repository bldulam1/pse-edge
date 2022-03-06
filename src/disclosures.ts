import axios from 'axios'
import { parse } from 'node-html-parser'

import { stockLoader } from './directory'

/**
 * Gets company disclosures of a ticker symbol from PSE Edge.
 * @param sym Ticker Symbol (e.g. GLO, TEL, ALI)
 * @returns CompanyDisclosure
 */
export const getCompanyDisclosures = async (sym: string) => {
  const companyId = await stockLoader.load(sym).then((v) => v?.companyId)

  if (companyId) {
    return axios
      .post(`https://edge.pse.com.ph/companyDisclosures/search.ax?keyword=${companyId}&tmplNm=`)
      .then((r) => parse(r.data))
      .then((html) => {
        return html
          .querySelector('table')
          ?.querySelectorAll('tr')
          .map((tr) => {
            const getLink = () => {
              const aTag = tr.querySelector('a')
              if (aTag) {
                const edgeNo = aTag.attributes.onclick.split(/openPopup\('|'\);return false;/).find((w) => w.length)
                return `https://edge.pse.com.ph/openDiscViewer.do?edge_no=${edgeNo}`
              }
            }

            const link = getLink()
            const [name, date, _, id] = tr.querySelectorAll('td').map((v) => v.innerText)

            return { id: id?.replace(/\s/g, '') || '', link, name, date }
          })
          .filter((v) => v.id)
      })
  }

  throw new Error(`${sym} not found`)
}
