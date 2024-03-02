import { getAllHackableServers } from "/checkServers";

export async function main(ns: NS): Promise<void> {
    const serverNames = await getAllHackableServers(ns);

    for (const serverName of serverNames) {
        const security = ns.getServerSecurityLevel(serverName);
        const growth = ns.getServerGrowth(serverName);
        const growTime = ns.formatNumber(ns.getGrowTime(serverName)/1000);
        const hackTime = ns.formatNumber(ns.getHackTime(serverName)/1000);
        const weakenTime = ns.formatNumber(ns.getWeakenTime(serverName)/1000);

        ns.tprint({security, growth, growTime, hackTime, weakenTime})
    }
}
