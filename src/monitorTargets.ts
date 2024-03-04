import { NS } from '@ns'
import { getAllHackableServers } from '/checkServers';

export async function main(ns: NS): Promise<void> {
    while(true){
        await ns.sleep(1000)
        await printTargets(ns);
    }
}

const printTargets = async (ns: NS) => {
    const targets = await getAllHackableServers(ns);

    ns.ui.clearTerminal();

    for (const target of targets) {

        const server = ns.getServer(target);

        const { moneyMax, moneyAvailable, requiredHackingSkill, serverGrowth, hackDifficulty, minDifficulty } = server;
        if (moneyMax === undefined || moneyAvailable === undefined || hackDifficulty === undefined || minDifficulty === undefined || serverGrowth === undefined){
            continue;
        }

        ns.tprintf('%s', `${target.padEnd(20)}: $${ns.formatNumber(moneyAvailable).padStart(9)} / $${ns.formatNumber(moneyMax).padEnd(9)} || ${ns.formatNumber(hackDifficulty).padStart(7)} / ${ns.formatNumber(minDifficulty).padEnd(7)} || ${ns.formatNumber(serverGrowth).padEnd(6)} || ${requiredHackingSkill}`)
    }
}