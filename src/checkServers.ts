import { executeFunctionOnAllServers } from 'executeAll'
import { getAccess } from 'getAccess'

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
  const sortedServers = await getAllHostServers(ns);
  for (const serverName of sortedServers) {
    ns.tprint(serverName)
  }
}

export function getHackability(ns: NS, serverName: string): number {

  const {hacking: hackingFormulas} = ns.formulas;

  const server = ns.getServer(serverName);

  const {minDifficulty} = server;

  const weakenedServer = {...server, hackDifficulty: minDifficulty};

  const player = ns.getPlayer();

  const weakenTime = hackingFormulas.weakenTime(weakenedServer,player)
  const moneyMax = ns.getServerMaxMoney(serverName);
  // const minSecurity = ns.getServerMinSecurityLevel(serverName);
  // const growthRate = ns.getServerGrowth(serverName);
  // const minHackLevel = ns.getServerMinSecurityLevel(serverName)
  // const hackChance = ns.hackAnalyzeChance(serverName);
  const hackChance = hackingFormulas.hackChance(weakenedServer,player)

  const hackability = hackChance * moneyMax / (2 * weakenTime / 1000);
  return hackability;
}

export async function getAllHackableServers(ns: NS): Promise<string[]> {
  const results = await checkServers(ns);
  return results.filter(record => canHack(ns, record.host)).map(record => record.host).sort((a, b) => getHackability(ns, b) - getHackability(ns, a))
  // .slice(0,1)
  .filter((server: string) => ['n00dles'].includes(server))
}

export async function getAllHostServers(ns: NS): Promise<string[]> {
  const results = await checkServers(ns);
  return results.filter(record => canHost(ns, record.host)).map(record => record.host);
}

export async function getAccessibleServers(ns: NS): Promise<string[]> {
  const results = await checkServers(ns);
  return results.filter(record => ns.hasRootAccess(record.host)).map(record => record.host);
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
  
  if (ns.getServerMaxMoney(serverName) <= 0){
    return false;
  }
  
  if (ns.getPlayer().skills.hacking < ns.getServerRequiredHackingLevel(serverName)){
    return false;
  }
  // const hackChance = ns.hackAnalyzeChance(serverName);
  // ns.tprint(hackChance)
  // if (hackChance <= 0) {
  //   return false;
  // }
  
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

  // if (serverName === 'home') {
  //   return false;
  // }
  
  return true;
}