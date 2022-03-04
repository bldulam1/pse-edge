import { getHistoricalPrices } from '../history'

test('Fetch Symbol ALI', async () => {
  const ali = await getHistoricalPrices({ symbol: 'ali', startDate: new Date('2021-01-01') })
  ali?.forEach((row) => {
    expect(row).toBeInstanceOf(Object)
  })
})

test('Fetch Symbol ALI', async () => {
  const ali = await getHistoricalPrices({ symbol: 'glo', startDate: new Date('2021-01-01') })
  ali?.forEach((row) => {
    expect(row.c).not.toBeNull()
    expect(row.o).not.toBeNull()
    expect(row.h).not.toBeNull()
    expect(row.l).not.toBeNull()
    expect(row.value).not.toBeNull()
    expect(row.t).not.toBeNull()
  })
})
