import axios from 'axios'
import { parse } from 'node-html-parser'
import { camelCase } from './common'
import { stockLoader } from './directory'

export const getCompanyInfo = async (sym: string) => {
  const stock = await stockLoader.load(sym)

  const id = stock?.companyId
  if (id) {
    return axios
      .get(`https://edge.pse.com.ph/companyInformation/form.do?cmpy_id=${id}`)
      .then((r) => parse(r.data))
      .then((html) => {
        const props: any = {}

        props.companyName = html.querySelector('.compInfo > p')?.innerHTML
        props.description = html.querySelector('table.view>tr>td')?.innerHTML

        html
          .querySelectorAll('caption')
          .find((w) => /security/i.test(w.innerText))
          ?.parentNode.querySelectorAll('tr')
          .forEach((v) => {
            const param = v.querySelector('th')?.innerText.replace(/[^A-Za-z ]/g, '')
            if (param) {
              const key = camelCase(param)
              props[key] = v.querySelector('td')?.innerText
            }
          })

        html
          .querySelectorAll('caption')
          .find((w) => /contact/i.test(w.innerText))
          ?.parentNode.querySelectorAll('tr')
          .forEach((v) => {
            const param = v.querySelector('th')?.innerText.replace(/[^A-Za-z ]/g, '')
            if (param) {
              const key = camelCase(param)
              props[key] = v.querySelector('td')?.innerText
            }
          })

        const fiscalYear = props.fiscalYear.split('\r\n').shift()

        return {
          ...props,
          fiscalYear,
        } as StockCompanyInfo
      })
  }

  throw new Error(`Symbol(${sym}) not found`)
}

export interface StockCompanyInfo {
  companyName: string
  description: string
  sector: string
  subsector: string
  corporateLife: string
  incorporationDate: string
  numberOfDirectors: string
  stockholdersMeetingAsPerByLaws: string
  fiscalYear: string
  externalAuditor: string
  transferAgent: string
  businessAddress: string
  emailAddress: string
  telephoneNumber: string
  faxNumber: string
  website: string
}
