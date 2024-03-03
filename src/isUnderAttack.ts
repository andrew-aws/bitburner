import {getAllHostServers} from 'checkServers.js'

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
  if (ns.args.length < 1) {
    ns.tprint('Provide a server')
    return
  }

  const target = ns.args[0] as string;

  ns.tprint(await isTargetUnderAttack(ns, target))
}

/** @param {NS} ns */
export async function isTargetUnderAttack(ns: NS, target: string): Promise<boolean> {
  const servers = await getAllHostServers(ns)
 
  const targetAttacked = servers.map(
    server => {
      const processes = ns.ps(server)
      // return processes
      const processAttackingTarget = processes.some(element => {
        if (element.args.length === 0){
          return false
        } 
        if (element.args.includes(target)){
          return true
        }
        return false
      })
      return processAttackingTarget
    }
  ).some((element) => element)

  return targetAttacked;
}