import { getAccessibleServers } from 'checkServers'

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
  const serverLoads = await getServerLoads(ns)
  await serverLoads
    .filter(serverLoad => serverLoad.maxRam > 0)
    .forEach(
      serverLoad => {
        // ns.tprint(serverLoad)
        const { serverName, maxRam, usedRam } = serverLoad
        ns.tprintf('%s: %s / %s: %s', serverName, ns.formatRam(Math.abs(usedRam)), ns.formatRam(maxRam), ns.formatPercent(Math.abs(usedRam / maxRam)))
      }
    )
  // const serverLoad = await getServerLoad(ns);
  // ns.tprint(serverLoad)
}
type ServerLoadInfo = {
  serverName: string,
  maxRam: number,
  usedRam: number,
  money: number,
  moneyMax: number,
  load: number,
  serverSecurity: number,
  minServerSecurity: number
}

/** @param {NS} ns */
export async function getServerLoad(ns: NS): Promise<{ usedRam: number, maxRam: number, load: number }> {
  const serverLoads = await getServerLoads(ns);
  // ns.tprint(serverLoads);
  const usedRam = serverLoads.reduce((previousValue, currentValue) => previousValue + currentValue.usedRam, 0)
  const maxRam = serverLoads.reduce((previousValue, currentValue) => previousValue + currentValue.maxRam, 0)
  return { usedRam, maxRam, load: usedRam / maxRam }

}


/** @param {NS} ns */
export async function getServerLoads(ns: NS): Promise<ServerLoadInfo[]> {
  const serverNames = await getAccessibleServers(ns);

  const serverLoads = serverNames.map(
    (serverName: string) => {
      const maxRam = ns.getServerMaxRam(serverName);
      const usedRam = ns.getServerUsedRam(serverName);
      const money = ns.getServerMoneyAvailable(serverName);
      const moneyMax = ns.getServerMaxMoney(serverName);
      const serverSecurity = ns.getServerSecurityLevel(serverName);
      const minServerSecurity = ns.getServerMinSecurityLevel(serverName);
      return { serverName, maxRam, usedRam, money, moneyMax, load: usedRam / maxRam, serverSecurity, minServerSecurity };
    }
  )
  return serverLoads;
}