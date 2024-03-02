import { getServerLoads } from 'serverLoad'
import { progressBar } from 'progressBar'
import { getAllHackableServers } from 'checkServers';

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {

  ns.atExit(() => {
    ns.ui.clearTerminal();
  })
  while (true) {
    await printLoads(ns, 50);
    // break;
    await ns.sleep(100);
  }
}

/** @param {NS} ns */
const printLoads = async (ns: NS, size: number) => {
  const serverLoads = await getServerLoads(ns);
  const progressBars = serverLoads.map(
    serverLoad => {
      const { load } = serverLoad;
      const progress = progressBar(load, size)
      return { ...serverLoad, progressBar: progress };
    }
  )

  ns.ui.clearTerminal()

  const maxServerNameLength = Math.max(...progressBars.map(info => info.serverName.length))
  // const largestServerMoney = Math.max(...progressBars.map(info => info.moneyMax))
  

  const hackableServers = await getAllHackableServers(ns);
  for (const serverLoadInfo of progressBars) {
    const { usedRam, serverName, moneyMax } = serverLoadInfo;
    if (usedRam <= 0 && (hackableServers.includes(serverName) === false || moneyMax <= 0)) {
      continue
    }

    printServerInfo(ns, serverLoadInfo, maxServerNameLength);


  }
}

type ServerInfoObject = {
  serverName: string,
  load: number,
  maxRam: number,
  usedRam: number,
  money: number,
  moneyMax: number,
  progressBar: string,
  serverSecurity: number,
  minServerSecurity: number
}

/** @param {NS} ns */
const printServerInfo = (ns: NS, serverInfo: ServerInfoObject, maxServerNameLength: number) => {
  const { serverName, load, maxRam, usedRam, money, moneyMax, progressBar, serverSecurity, minServerSecurity } = serverInfo;

  const padding = 9;
  const formattedServerName = serverName.padEnd(maxServerNameLength + 1, ' ');
  const formattedMoney = '$' + ns.formatNumber(money).padStart(padding, ' ');
  const formattedMaxMoney = '$' + ns.formatNumber(moneyMax).padEnd(padding, ' ');
  const formattedUsedRam = ns.formatRam(usedRam).padStart(padding, ' ');
  const formattedMaxRam = ns.formatRam(maxRam).padEnd(padding, ' ');
  const formattedLoad = isNaN(load) ? 'N/A'.padStart(padding, ' ') : ns.formatPercent(Math.abs(load)).padStart(padding, ' ');
  const formattedSecurity = ns.formatNumber(serverSecurity).padStart(padding, ' ');
  const formattedMinSecurity = ns.formatNumber(minServerSecurity).padEnd(padding, ' ');

  ns.tprintf('%s', `${formattedServerName}: ${formattedMoney} / ${formattedMaxMoney}||${formattedSecurity} / ${formattedMinSecurity}||${formattedUsedRam} / ${formattedMaxRam}||${formattedLoad} ${progressBar}`)

}




