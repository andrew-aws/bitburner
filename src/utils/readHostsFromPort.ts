import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
    const hosts = readServers(ns);

    ns.tprint(hosts);
}

export function readServers(ns: NS): string[] {
    const portData = ns.peek(1);

    if (typeof (portData) !== 'string' || portData === 'NULL PORT DATA') {
        return [];
    }

    const portInfo = JSON.parse(portData) as { hostServers: string[] };

    const { hostServers } = portInfo;

    return hostServers.sort((a, b) => sortHosts(ns, a, b))

}

const sortHosts = (ns: NS, a: string, b: string) => {
    if (a.includes('hacknet') === b.includes('hacknet')) {
        const memoryDifference = getFreeMemory(ns, b) - getFreeMemory(ns, a);
        return memoryDifference;
    }

    return a.includes('hacknet') ? 1 : -1;
}

const getFreeMemory = (ns: NS, serverName: string) => {
    const maxMemory = ns.getServerMaxRam(serverName);
    const usedMemory = ns.getServerUsedRam(serverName);

    return maxMemory - usedMemory;
}