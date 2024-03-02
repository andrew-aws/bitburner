import { executeFunctionOnAllServers } from 'executeAll'
import { getAccess } from 'getAccess'

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
  const sortedServers = await getAccessibleServers(ns);
  for (const serverName of sortedServers) {
    const moneyMax = ns.getServerMaxMoney(serverName);
    const minSecurity = ns.getServerMinSecurityLevel(serverName);
    const growthRate = ns.getServerGrowth(serverName);
    const hackability = moneyMax * growthRate/ minSecurity;
    ns.tprint(`${serverName} ${ns.formatNumber(hackability)}`)
  }
}

export async function getAllHackableServers(ns: NS): Promise<string[]> {
  const results = await checkServers(ns);
  return results.filter(record => canHack(ns, record.host)).map(record => record.host)
  .filter((server: string) => ['n00dles','silver-helix','harakiri-sushi'].includes(server));
}

export async function getAllHostServers(ns: NS): Promise<string[]> {
  const results = await checkServers(ns);
  return results.filter(record => canHost(ns, record.host)).map(record => record.host).sort((a,b) => sortHosts(a,b));
}

export async function getAccessibleServers(ns: NS): Promise<string[]> {
  const results = await checkServers(ns);
  return results.filter(record => ns.hasRootAccess(record.host)).map(record => record.host).sort((a,b) => sortHosts(a,b));
}

const sortHosts = (a: string, b: string) => {
  if (a.includes('hacknet') === b.includes('hacknet')){
    return 0;
  }
  return a.includes('hacknet') ? 1 : -1;
}

/** @param {NS} ns */
export async function checkServers(ns: NS): Promise<HackingRecord<typeof getAccess>[]> {
  const records = await executeFunctionOnAllServers(ns, getAccess);

  if (!records.length) {
    return []
  }
  // const minAccountSize = 0

  // const hackableServers = records
  //   .filter(record => canHack(ns, record.host))
  //   .filter(record => ns.getServerMaxMoney(record.host) > minAccountSize);

  return records;
}

function canHack(ns: NS, serverName: string): boolean {
  if (!ns.hasRootAccess(serverName)) {
    return false;
  }
  const hackChance = ns.hackAnalyzeChance(serverName);
  if (hackChance <= 0) {
    return false;
  }
  
  return true;
}

function canHost(ns: NS, serverName: string): boolean {
  if (!ns.hasRootAccess(serverName)) {
    return false;
  }
  
  if (ns.getServerMaxRam(serverName) <= 0 ) {
    return false;
  }

  if (serverName.includes('hacknet')) { 
    return false;
  }
  
  return true;
}