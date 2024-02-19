/** @param {NS} ns */
export async function main(ns: NS) {
  const tix = ns.stock;
  while (true) {
    await kelly(ns);
    await tix.nextUpdate();
    // break
  }
}

const kelly = async (ns: NS) => {
  const tix = ns.stock;
  ns.atExit(() => {
    closeAllPositions(ns);
  })

  const symbols = tix.getSymbols();

  const portfolioValue = await getPortfolioValue(tix, symbols);
  const playerMoney = ns.getPlayer().money;
  const netWorth = portfolioValue + playerMoney;

  // ns.toast(ns.vsprintf('Net worth: $%s', ns.formatNumber(netWorth)), 'info')

  const kellyRatios = await getKellyRatios(ns, symbols);

  const commission = 1e5;

  const idealPositions = kellyRatios.map(
    kellyElement => {
      const { stockSymbol, kellyRatio } = kellyElement;

      const growthRate = getGrowthRate(kellyElement);

      const maxShares = tix.getMaxShares(stockSymbol);

      const idealNumShares = Math.min(maxShares, Math.abs(kellyRatio * netWorth));

      return { ...kellyElement, idealNumShares, growthRate };
    }
  )
    .sort((a, b) => b.growthRate - a.growthRate);

  for (const idealPosition of idealPositions) {
    const { stockSymbol, idealNumShares, kellyRatio } = idealPosition;
    const [longPosition, , shortPosition,] = tix.getPosition(stockSymbol);

    if (kellyRatio > 0) {
      if (shortPosition) {
        await closePosition(ns, stockSymbol);
      }
    }
    if (kellyRatio < 0) {
      if (longPosition) {
        await closePosition(ns, stockSymbol);
      }

      // Exploits the weird nature of shorts in this game
      if ((tix.getSaleGain(stockSymbol, shortPosition, 'Short')) > 1.2 * tix.getPurchaseCost(stockSymbol, shortPosition, 'Short')) {
        ns.toast(`Redistributing ${stockSymbol} short position`, `info`)
        tix.sellShort(stockSymbol, shortPosition);
      }
    }
  }

  for (const idealPosition of idealPositions) {
    const { stockSymbol, idealNumShares, kellyRatio } = idealPosition;
    const [longPosition, , shortPosition,] = tix.getPosition(stockSymbol);

    const currentMoney = ns.getPlayer().money;

    if (currentMoney < commission * 100) {
      break;
    }

    if (kellyRatio > 0) {
      const idealLongShares = Math.floor(idealNumShares);
      if (idealLongShares > longPosition) {
        const askPrice = tix.getAskPrice(stockSymbol);
        for (let numSharesToBuy = Math.min(idealLongShares - longPosition, Math.floor((currentMoney - commission) / askPrice)); numSharesToBuy > 0; numSharesToBuy--) {
          const purchaseCost = tix.getPurchaseCost(stockSymbol, numSharesToBuy, 'Long');
          if (purchaseCost < currentMoney) {
            tix.buyStock(stockSymbol, numSharesToBuy);
            break;
          }
          await ns.sleep(1);
        }
      }
    }
    // else if (kellyRatio < 0) {
    //   const idealShortShares = Math.floor(idealNumShares);
    //   if (idealShortShares > shortPosition) {
    //     const bidPrice = tix.getBidPrice(stockSymbol);
    //     for (let numSharesToShort = Math.min(idealShortShares - shortPosition, Math.floor((currentMoney - commission) / bidPrice)); numSharesToShort > 0; numSharesToShort--) {
    //       const purchaseCost = tix.getPurchaseCost(stockSymbol, numSharesToShort, 'Short');
    //       if (purchaseCost < currentMoney) {
    //         tix.buyShort(stockSymbol, numSharesToShort)
    //         break;
    //       }
    //       await ns.sleep(1);
    //     }
    //   }
    // }
  }
}

type KellyElement = {
  forecast: number,
  volatility: number,
  kellyRatio: number
}

const getGrowthRate = (kellyElement: KellyElement) => {
  const { forecast, volatility, kellyRatio } = kellyElement;

  const a = volatility;
  const b = volatility;
  const p = forecast;
  const q = 1 - forecast;
  const f = Math.max(Math.min(kellyRatio, 1), -1);

  const growthRate = Math.pow(1 + f * b, p) * Math.pow(1 - f * a, q);

  return growthRate;
}

/** 
 * @param {TIX} tix 
 * @param {Array} symbols */
const getPortfolioValue = async (tix: NS['stock'], symbols: string[]) => {
  const portfolioValue = symbols.reduce(
    (accumulator: number, stockSymbol: string) => {
      const [longPosition, , shortPosition,] = tix.getPosition(stockSymbol);

      const positionValue = tix.getSaleGain(stockSymbol, longPosition, 'Long') + tix.getSaleGain(stockSymbol, shortPosition, 'Short')

      return accumulator + positionValue;
    },
    0)

  return portfolioValue;
}

const getKellyRatios = async (ns: NS, symbols: string[]) => {
  const tix = ns.stock;
  const idealPositions = symbols.map(
    stockSymbol => {
      const forecast = tix.getForecast(stockSymbol);
      const volatility = tix.getVolatility(stockSymbol);

      const kellyRatio = forecast / volatility - (1 - forecast) / volatility;

      return { stockSymbol, kellyRatio, forecast, volatility };
    }

  )

  const sortedPositions = idealPositions.sort((a, b) => Math.abs(b.kellyRatio - a.kellyRatio))

  return sortedPositions;
}

/** @param {TIX} tix
 * @param {NS} ns */
const closeAllPositions = (ns: NS) => {
  const tix = ns.stock;
  const symbols = tix.getSymbols();
  symbols.forEach(
    stockSymbol => {
      closePosition(ns, stockSymbol);
    }
  )
}

/** @param {NS} ns */
const closePosition = (ns: NS, stockSymbol: string) => {
  const tix = ns.stock;
  const [longPosition, avgLongPrice, shortPosition, avgShortPrice] = tix.getPosition(stockSymbol);

  if (longPosition) {
    const profit = tix.getSaleGain(stockSymbol, longPosition, 'Long') - longPosition * avgLongPrice;
    const message = ns.vsprintf('Selling %s shares of %s for $%s %s', [ns.formatNumber(longPosition), stockSymbol, ns.formatNumber(Math.abs(profit)), (profit) > 0 ? 'profit' : 'loss']);
    ns.toast(message, profit > 0 ? 'success' : 'error');
    tix.sellStock(stockSymbol, longPosition)
  }

  if (shortPosition) {
    const profit = tix.getSaleGain(stockSymbol, shortPosition, 'Short') - shortPosition * avgShortPrice;
    const message = ns.vsprintf('Buying %s shares of %s for $%s %s', [ns.formatNumber(shortPosition), stockSymbol, ns.formatNumber(Math.abs(profit)), profit > 0 ? 'profit' : 'loss'])
    ns.toast(message, profit > 0 ? 'success' : 'error');
    tix.sellShort(stockSymbol, shortPosition)
  }
}