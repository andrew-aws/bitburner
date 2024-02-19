/** @param {NS} ns */
export async function checkAccess(ns: NS, serverName: string): Promise<boolean> {
  return ns.hasRootAccess(serverName)
}