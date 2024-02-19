import {getAccess} from 'getAccess'

/** @param {NS} ns */
export async function main(ns: NS) {
  await accessAllServers(ns, 'home', [])
}

/** @param {NS} ns */
const accessAllServers = async (ns: NS, serverName: string, hackedServers: string[]) => {

  if (hackedServers.includes(serverName)) {
    return;
  }
  await accessServer(ns, serverName)
  hackedServers.push(serverName)

  const servers = ns.scan(serverName)

  for (const server of servers) {
    await accessAllServers(ns, server, hackedServers)
  }

}

/** @param {NS} ns */
const accessServer = async (ns: NS, serverName: string) => {
  if (serverName === 'home') {
    return
  }
  const access = await getAccess(ns, serverName);

  if (!access) {
    return
  }
}