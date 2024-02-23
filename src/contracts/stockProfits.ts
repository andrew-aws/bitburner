import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
    const stockHistory = [26, 46, 132, 71, 180, 4, 41, 28, 159, 91, 32, 52, 138, 175, 192, 13, 78, 174, 40, 124, 146, 157, 91, 16, 20, 103, 178, 151, 103, 81, 55, 35, 164, 92, 141, 167, 109, 125, 6, 200, 138, 22, 199, 185, 50]
    ns.tprint(stockProfits(stockHistory,1))
}

const stockProfits = (stockHistory: number[], numTransactions = 1) => {
    if (numTransactions <= 0 ){
        return 0;
    }
    let bestProfit = 0;
    for (let buyIndex = 0; buyIndex < stockHistory.length; buyIndex++) {
        for (let sellIndex = buyIndex + 1; sellIndex < stockHistory.length; sellIndex++) {
            const profit = stockHistory[sellIndex] - stockHistory[buyIndex] + stockProfits(stockHistory.slice(sellIndex + 1),numTransactions - 1)
            if (profit > bestProfit) {
                bestProfit = profit;
            }
        }
    }

    return bestProfit;
}