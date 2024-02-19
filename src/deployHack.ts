import { checkServers } from 'checkServers'

/** @param {NS} ns */
export async function deployHack(ns: NS, serverName: string) {
  const scriptName = 'oldHack.js'
  const scriptRamCost = ns.getScriptRam(scriptName)

  const maxRam = ns.getServerMaxRam(serverName)
  const usedRam = ns.getServerUsedRam(serverName)

  const numThreads = Math.floor((maxRam - usedRam) / scriptRamCost)

  if (numThreads > 0) {
    ns.scp(scriptName, serverName, 'home')

    const target = await getTarget(ns, serverName)
    ns.tprint('Deploying hack on ', serverName, ' targeting ', target)
    ns.exec(scriptName, serverName, numThreads, target)

  }
}

/** @param {NS} ns */
const getTarget = async (ns: NS, serverName: string) => {

  const targetAssignment = await getTargetAssignment(ns, serverName);
  if (targetAssignment) {
    return targetAssignment;
  }
  const requiredHackingSkill = ns.getServerRequiredHackingLevel(serverName)
  const playerHackingSkill = ns.getPlayer().skills.hacking
  if (requiredHackingSkill > playerHackingSkill){
    return ''
  }
  return serverName;
}

/** @param {NS} ns */
const getTargetAssignment = async (ns: NS, serverName: string) => {
  const server = ns.getServer(serverName)
  const sortedServers = (await checkServers(ns))
  
  const purchasedServers = ns.getPurchasedServers()

  for (let i = 0; i < purchasedServers.length; i++) {
    if (serverName === purchasedServers[i]) {
      const serverIndex = i % sortedServers.length
      const sortedServer = sortedServers[serverIndex]
      return sortedServer.host
    }
  }

  if (server.moneyMax === 0) {
    return sortedServers[0].host
  }

  return null;
}