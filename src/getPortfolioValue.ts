/** @param {NS} ns */
export async function main(ns: NS) {
  const portfolioValue = getPortfolioValue(ns);
  ns.tprint(ns.formatNumber(portfolioValue));
}

/** @param {NS} ns */
export function getPortfolioValue(ns: NS) {
  const tix = ns.stock;

  const symbols = tix.getSymbols();

  const value = symbols.reduce(
    (accumulatorPromise, stockSymbol) => {
      const positionValue = getPositionValue(ns, stockSymbol);
      const accumulator = accumulatorPromise
      return accumulator + positionValue;
    },
    0
  );

  return value;

}

/** @param {NS} ns */
export function getPositionValue(ns: NS, stockSymbol: string) {
  const tix = ns.stock;
  const [longPosition, , shortPosition,] = tix.getPosition(stockSymbol);
  const value = tix.getSaleGain(stockSymbol, longPosition, 'Long') + tix.getSaleGain(stockSymbol, shortPosition, 'Short');
  return value;
}