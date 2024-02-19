/** @param {NS} ns */
export async function getAccess(ns: NS, serverName: string): Promise<boolean> {
  // ns.tprint('Getting access to ',serverName)
  if (ns.hasRootAccess(serverName)) {
    return true
  }

  openPorts(ns, serverName)

  return ns.hasRootAccess(serverName);
}


/**
 * Opens ports on the specified host using various port programs.
 * 
 * @param ns - The namespace object.
 * @param host - The host to open ports on.
 */
function openPorts(ns: NS, host: string): void {
  const portProgramFunctions = [ns.brutessh, ns.ftpcrack, ns.relaysmtp, ns.httpworm, ns.sqlinject, ns.nuke]
  for (const program of portProgramFunctions) {
    try {
      // ns.tprint(program, host)
      program(host)
    } catch (e) {
      // ns.tprint(e)
      continue
    }
  }
}

