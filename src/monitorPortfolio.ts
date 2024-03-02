import { NS } from '@ns'

type PortfolioValue = {
    longValue: number,
    shortValue: number,
    recordedProfit: number
}

export async function main(ns: NS): Promise<void> {
    const portFolioValueHistory = [];
    let recordedProfit = 0;

    ns.atExit(() => {
        ns.ui.clearTerminal();
    })

    while (true) {
        await ns.stock.nextUpdate();
        await ns.sleep(1000)
        while (true) {
            await ns.sleep(1);
            const portData = ns.readPort(1);

            if (portData === 'NULL PORT DATA') {
                break;
            }

            if (typeof(portData) !== 'number'){
                break;
            }

            recordedProfit += portData;
        }
        ns.ui.clearTerminal();
        const portfolioValue = getPortfolioValue(ns, recordedProfit);
        printPortfolioValue(ns, recordedProfit);
        portFolioValueHistory.push(portfolioValue);
        printChart(ns, portFolioValueHistory);
        // break;
    }
}

const printPortfolioValue = (ns: NS, recordedProfit: number) => {
    const { shortValue, longValue } = getPortfolioValue(ns, recordedProfit);

    if (longValue) {
        ns.tprintf('%s', `Long Value: $${ns.formatNumber(longValue)} `)
    }
    if (shortValue) {
        ns.tprintf('%s', `Short Value: $${ns.formatNumber(shortValue)} `)
    }
}

const getPortfolioValue = (ns: NS, recordedProfit: number) => {
    const { stock: tix } = ns;
    const stockSymbols = tix.getSymbols();
    const portfolioValue = stockSymbols.reduce(
        (previousValue, stockSymbol) => {
            const { longValue, shortValue } = previousValue;
            const [longPostion, avgLongPrice, shortPosition, avgShortPrice] = tix.getPosition(stockSymbol);
            return { longValue: longValue + tix.getSaleGain(stockSymbol, longPostion, 'Long') - avgLongPrice * longPostion, shortValue: shortValue + tix.getSaleGain(stockSymbol, shortPosition, 'Short') - avgShortPrice * shortPosition, recordedProfit }
        },
        {
            longValue: 0,
            shortValue: 0,
            recordedProfit
        }
    )

    return portfolioValue;

}

const printChart = (ns: NS, history: PortfolioValue[]) => {
    if (history.length <= 1) {
        return;
    }

    const numRows = 45;
    const numColumns = 60;

    const reducedHistory = history.map(({ longValue, shortValue, recordedProfit }) => longValue + shortValue + recordedProfit).slice(-1 * numColumns);

    const minValue = Math.min(...reducedHistory, 0);
    const maxValue = Math.max(...reducedHistory, 0);
    const range = maxValue - minValue;
    for (let rowNumber = numRows; rowNumber >= 0; rowNumber--) {
        const row = []
        const rowElevation = rowNumber / numRows;
        const rowHeight = 1 / numRows;
        const rowCenter = rowElevation * range + minValue
        row.push(`$${ns.formatNumber(rowCenter)}`.padEnd(10))
        for (const totalValue of reducedHistory) {
            const valueElevation = (totalValue - minValue) / range;
            if (Math.abs(rowCenter) < range * rowHeight / 2) {
                row.push('==');
            }
            else if (Math.abs(valueElevation - rowElevation) < rowHeight / 2) {
                if (totalValue > 0) {
                    row.push('/\\')
                }
                else {
                    row.push('\\/')
                }
            }
            else if (rowElevation < valueElevation === rowCenter > 0) {
                row.push('||');
            }
            else {
                row.push('  ');
            }
        }
        ns.tprintf('%s', row.join(''));
    }
}
