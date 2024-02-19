export async function main(ns: NS) {
  if (ns.args.length < 1) {
    return;
  }

  const serverName = ns.args[0] as string;

  const serverChain = await scanServers(ns, serverName, 'home', []);
  if (serverChain) {
    ns.tprintf('%s', serverChain.join('; connect '));
  }
  else {
    ns.tprintf('Failed to find %s', serverName)
  }
}

/** @param {NS} ns */
const scanServers = (ns: NS, serverName: string, thisServer: string, serverChain: string[]): string[] => {
  if (serverName === thisServer) {
    return [...serverChain, serverName];
  }

  const nearbyServers = ns.scan(thisServer);

  const filteredServers = nearbyServers.filter(
    serverName => serverChain.includes(serverName) === false
  )

  for (const server of filteredServers) {
    const newServerChain = scanServers(ns, serverName, server, [...serverChain, thisServer])
    if (newServerChain.length > 0) {
      return newServerChain
    }
  }

  return [];
}