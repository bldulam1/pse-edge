import { getCompanyDisclosures } from '../disclosures'

test('Fetch Symbol ALI', async () => {
  const ali = await getCompanyDisclosures('ali')

  expect(ali).not.toBeNull()

  ali?.forEach((row) => {
    expect(row.date).not.toBeNull()
    expect(row.id).not.toBeNull()
    expect(row.link).not.toBeNull()
    expect(row.name).not.toBeNull()
  })
})
