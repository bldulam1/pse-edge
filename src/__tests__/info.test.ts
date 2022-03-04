import { getCompanyInfo } from '../info'

test('Company Info', async () => {
  const ali = await getCompanyInfo('ali')
  expect(ali.companyName).toEqual('Ayala Land, Inc.')
})

test('Company Info', async () => {
  const glo = await getCompanyInfo('glo')
  expect(glo.companyName).toEqual('Globe Telecom, Inc.')
})
