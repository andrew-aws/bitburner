import {checkServers} from 'checkServers.js'


/** @param {NS} ns */
export async function main(ns: NS) {
  const servers = await checkServers(ns);
  for (const serverName of servers) {
    checkForContract(ns, serverName.host);
  }
}

/** @param {NS} ns */
const checkForContract = async (ns: NS, serverName: string) => {
  const filesOnServer = ns.ls(serverName,'cct');
  if (filesOnServer.length){
    ns.tprint(serverName);
  }
}