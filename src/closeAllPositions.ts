/** @param {NS} ns */
export async function main(ns: NS) {
  const {stock: tix} = ns;

  const symbols = tix.getSymbols();

  for (const stockSymbol of symbols) {
    const [longPosition, , shortPosition, ] = tix.getPosition(stockSymbol);

    if (longPosition) {
      tix.sellStock(stockSymbol, longPosition);
    }
    if (shortPosition) {
      tix.sellShort(stockSymbol, shortPosition);
    }
  }
}