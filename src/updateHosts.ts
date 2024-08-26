import { NS } from '@ns'
import { getAllHostServers } from '/checkServers'

export async function main(ns : NS) : Promise<void> {
    while (true) {
        await ns.sleep(10000)

        const hostServers = await getAllHostServers(ns);

        const portInfo = {hostServers}

        ns.clearPort(1);

        ns.writePort(1, JSON.stringify(portInfo));
    }
}