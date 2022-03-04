const { fetchStocksAll, getCompanyDisclosures, getCompanyInfo, getHistoricalPrices } = require('pse-edge/lib')

fetchStocksAll().then(console.log)
getCompanyDisclosures('glo').then(console.log)
getCompanyInfo('tel').then(console.log)
getHistoricalPrices({ symbol: 'tel', startDate: '2021-02-02' }).then(console.log)
