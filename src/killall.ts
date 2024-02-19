import { executeFunctionOnAllServers } from 'executeAll.js'

/** @param {NS} ns */
export async function main(ns: NS) {
  await executeFunctionOnAllServers(ns, killProcessess)
}

/** @param {NS} ns */
const killProcessess = async (ns: NS, serverName: string) => {
  if (ns.ps(serverName).length == 0) {
    return;
  }
  if (serverName !== 'home') {
    ns.tprint('Killing all process on ', serverName)
    ns.killall(serverName)
  }
}