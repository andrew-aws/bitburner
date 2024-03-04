import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
    const numberSet = [2, 3, 4, 5, 7, 10, 11, 12];
    const targetNumber = 25

    const results: number[][] = []

    const sums = (ns: NS, sumArray: number[] = []): void => {
        const sum = sumArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
        if (targetNumber < sum) {
            return;
        }
        if (targetNumber === sum) {
            results.push(sumArray);
            return;
        }
        for (const thisNumber of numberSet) {
            if (thisNumber >= Math.max(...sumArray)) {
                sums(ns, [...sumArray, thisNumber])
            }
        }
    }

    sums(ns);
    ns.tprint(results.length)
}
