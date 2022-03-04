import { fetchStocksAll, stockLoader } from '../directory'

test('PSE Stocks list', async () => {
  const stocks = await fetchStocksAll()
  stocks.forEach((stock) => {
    expect(stock).toBeInstanceOf(Object)
  })
})

test('Fetch Symbol GLO', async () => {
  const glo = await stockLoader.load('GLO')
  expect(glo?.secName).toEqual('Globe Telecom, Inc.')
})

test('Fetch Symbol TEL', async () => {
  const tel = await stockLoader.load('tel')
  expect(tel?.secName).toEqual('PLDT Inc.')
})

test('Fetch Symbol ALI', async () => {
  const ali = await stockLoader.load('ali')
  expect(ali?.secName).toEqual('Ayala Land, Inc.')
})
