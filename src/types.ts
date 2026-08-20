export interface PseStock {
  companyId: string
  listingDate: Date
  secName: string
  sector: string
  securityId: string
  subSector: string
  symbol: string
}

export interface CompanyDisclosure {
  id: string
  link?: string
  name: string
  date: string
}

export interface BalanceSheet {
  CurrentAssets?: number
  TotalAssets?: number
  CurrentLiabilities?: number
  TotalLiabilities?: number
  RetainedEarningsDeficit?: number
  StockholdersEquity?: number
  StockholdersEquityParent?: number
  BookValuePerShare?: number
}

export interface IncomeStatement {
  GrossRevenue?: number
  GrossExpense?: number
  IncomeBeforeTax?: number
  NetIncomeAfterTax?: number
  NetIncomeAttributableToParent?: number
  EarningsPerShareBasic?: number
  EarningsPerShareDiluted?: number
}

export interface PseFinancial {
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

export interface HistoricalPrice {
  o: number
  h: number
  l: number
  c: number
  t: string
  value: number
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
