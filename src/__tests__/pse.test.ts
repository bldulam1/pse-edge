import { fetchStocksAll, stockLoader } from '../index';

test('PSE Stocks list', async () => {
  const stocks = await fetchStocksAll();
  stocks.forEach((stock) => {
    expect(stock).toBeInstanceOf(Object);
  });
});

test('Fetch Symbol GLO', async () => {
  const glo = await stockLoader.load('GLO');
  expect(glo?.secName).toEqual('Globe Telecom, Inc.');
});

test('Fetch Symbol TEL', async () => {
  const glo = await stockLoader.load('tel');
  expect(glo?.secName).toEqual('PLDT Inc.');
});

test('Fetch Symbol ALI', async () => {
  const glo = await stockLoader.load('ali');
  expect(glo?.secName).toEqual('Ayala Land, Inc.');
});
