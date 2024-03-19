import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    for (let i = 1; i<50; i++){
        ns.tprint(ns.formatNumber(ns.weakenAnalyze(i)/i))
    }
}