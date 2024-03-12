import { NS } from '@ns'
import { getAllHostServers } from '/checkServers';

export async function main(ns : NS) : Promise<void> {
    while(true){
        await deployPower(ns);
        await ns.sleep(1000);
    }
}

const deployPower = async (ns: NS) => {
    const scriptName = 'power.js'
    const ramCost = ns.getScriptRam(scriptName);

    const hosts = await getAllHostServers(ns);

    hosts.forEach(
        host => {
            const usedRam = ns.getServerUsedRam(host);
            const maxRam = ns.getServerMaxRam(host);
            const availableRam = maxRam - usedRam;
            const numThreads = Math.floor(availableRam/ramCost);
            if (numThreads <= 0) {
                return;
            }
            if (ns.ls(host,scriptName).length === 0) {
                ns.scp(scriptName,host)
            }
            ns.exec(scriptName,host,numThreads)

        }
    )
}