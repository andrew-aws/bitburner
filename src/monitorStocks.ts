import { getPositionValue } from 'getPortfolioValue.js'

/** @param {NS} ns */
export async function main(ns: NS) {

  ns.atExit(() => {
    ns.ui.clearTerminal();
  })

  while (true) {
    const allStockInfo = await getStockInfo(ns);

    ns.ui.clearTerminal();

    ns.tprintf('%s %s %s %s %s %s %s %s %s', 'Symbol'.padEnd(12), 'Max'.padEnd(12), 'Long'.padEnd(12), 'Short'.padEnd(12), 'Bid'.padEnd(12), 'Ask'.padEnd(12), 'Value'.padEnd(12), 'Forecast'.padEnd(12), 'Volatility'.padEnd(12))
    for (const stockInfo of allStockInfo) {
      const { stockSymbol, askPrice, bidPrice, longPosition, shortPosition, positionValue, forecast, volatility } = stockInfo;
      ns.tprintf('%s %s %s %s %s %s %s %s %s', stockSymbol.padEnd(12), ns.formatNumber(ns.stock.getMaxShares(stockSymbol)).padEnd(12), ns.formatNumber(longPosition).padEnd(12), ns.formatNumber(shortPosition).padEnd(12), ('$' + ns.formatNumber(bidPrice)).padEnd(12), ('$' + ns.formatNumber(askPrice)).padEnd(12), ('$' + ns.formatNumber(positionValue)).padEnd(12), ns.formatNumber(forecast).padEnd(12), ns.formatNumber(volatility, 4).padEnd(12));
    }

    await ns.stock.nextUpdate();

  }
}

/** @param {NS} ns */
export async function getStockInfo(ns: NS) {
  const tix = ns.stock;
  const stockSymbols = tix.getSymbols();

  const stockInfo = await Promise.all(stockSymbols.map(
    async stockSymbol => {
      const askPrice = tix.getAskPrice(stockSymbol);
      const bidPrice = tix.getBidPrice(stockSymbol);
      const [longPosition, avgLongPrice, shortPosition, avgShortPrice] = tix.getPosition(stockSymbol);
      const positionValue = await getPositionValue(ns, stockSymbol);
      const forecast = tix.getForecast(stockSymbol);
      const volatility = tix.getVolatility(stockSymbol);


      return { stockSymbol, bidPrice, askPrice, longPosition, avgLongPrice, shortPosition, avgShortPrice, positionValue, forecast, volatility };
    }
  ))

  return stockInfo;
}