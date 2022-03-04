# PSE Edge

Note: This is still a work in progress, not yet for production

![GitHub](https://img.shields.io/github/license/bldulam1/pse-edge?style=plastic)
[![Node.js CI](https://github.com/bldulam1/pse-edge/actions/workflows/node.js.yml/badge.svg)](https://github.com/bldulam1/pse-edge/actions/workflows/node.js.yml)


This is a wrapper of the PSE Edge backend API, useful for scraping data from PSE Edge. It provides the following services.

- [x] Official List of stocks by sector
- [x] Historical Prices
- [x] Public Company disclosures
- [x] Company Information
- [ ] Financial Reports


## Usage

#### Typescript
```typescript
import { fetchStocksAll, getCompanyDisclosures, getCompanyInfo, getHistoricalPrices } from 'pse-edge/lib'

// Fetch all stocks listed in the PSE
fetchStocksAll().then(console.log)

// Get all company disclosures of a stock symbol
getCompanyDisclosures('glo').then(console.log)

// Get company info of a stock symbol
getCompanyInfo('tel').then(console.log)

// Get Historical prices (daily OHLC) of a stock
getHistoricalPrices({ symbol: 'tel', startDate: '2021-02-02' }).then(console.log)

```

### Javascript
```javascript
const { fetchStocksAll, getCompanyDisclosures, getCompanyInfo, getHistoricalPrices } = require('pse-edge/lib')

fetchStocksAll().then(console.log)
getCompanyDisclosures('glo').then(console.log)
getCompanyInfo('tel').then(console.log)
getHistoricalPrices({ symbol: 'tel', startDate: '2021-02-02' }).then(console.log)

```