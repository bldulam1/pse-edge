import { getFinancialReports } from '../finance'

test('Fetch Symbol ALI', async () => {
  const ali = await getFinancialReports('ali')
  expect(ali.annual).not.toBeNull()
  expect(ali.quarterly).not.toBeNull()
})

test('Fetch Symbol CREIT', async () => {
  const ali = await getFinancialReports('creit')
  expect(ali.annual).not.toBeNull()
  expect(ali.quarterly).not.toBeNull()
})
