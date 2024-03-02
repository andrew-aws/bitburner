import { getAllHostServers, getAllHackableServers } from 'checkServers'
import { isTargetUnderAttack } from 'isUnderAttack'

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
  await attackServers(ns)
}

/** @param {NS} ns */
const attackServers = async (ns: NS) => {
  const hackMoneyFraction = 0.2;

  while (true) {
    const hostServers = await getAllHostServers(ns);
    const targetServers = (await getAllHackableServers(ns))
      .filter((server: string) => ns.getServerMaxMoney(server) > 0)
      .sort((a: string, b: string) => ns.getServerSecurityLevel(a) - ns.getServerSecurityLevel(b))
      // .filter((server: string) => ['n00dles','foodnstuff','sigma-cosmetics','harakiri-sushi'].includes(server))
      // .slice(0, 2)

    for (const targetServerName of targetServers) {
      // if (['iron-gym'].includes(targetServerName) === false) {
      //   continue;
      // }

      // if (getServerStockMap().find(serverInfo => serverInfo.serverName === targetServerName) === undefined) {
      //   continue;
      // }

      if (await isTargetUnderAttack(ns, targetServerName)) {
        continue
      }

      const targetSecurity = ns.getServerSecurityLevel(targetServerName);
      const targetMinSecurity = ns.getServerMinSecurityLevel(targetServerName);
      const targetMoney = ns.getServerMoneyAvailable(targetServerName);
      const targetMoneyMax = ns.getServerMaxMoney(targetServerName);
      const numHackThreads = Math.ceil(ns.hackAnalyzeThreads(targetServerName, hackMoneyFraction * targetMoney));

      const numGrowthThreads = Math.ceil(ns.growthAnalyze(targetServerName, Math.ceil(targetMoneyMax / (targetMoney + 1))));

      const growthImpact = ns.growthAnalyzeSecurity(numGrowthThreads, targetServerName);
      const hackImpact = ns.hackAnalyzeSecurity(numHackThreads, targetServerName);

      const targetSecurityDecrease = targetSecurity - targetMinSecurity;
      const weakeningPower = ns.weakenAnalyze(1);
      const numWeakeningThreads = Math.floor(targetSecurityDecrease / weakeningPower);
      const numWeakeningThreadsFromGrowth = Math.floor(growthImpact / weakeningPower);
      const numWeakeningThreadsFromHack = Math.floor(hackImpact / weakeningPower);

      if (numWeakeningThreads + numGrowthThreads > 0) {
        deployFromHosts(ns, { targetServerName, hostServers, scriptName: 'weaken.js', numThreads: numWeakeningThreads });
        deployFromHosts(ns, { targetServerName, hostServers, scriptName: 'grow.js', numThreads: numGrowthThreads });
        deployFromHosts(ns, { targetServerName, hostServers, scriptName: 'weaken.js', numThreads: numWeakeningThreadsFromGrowth });
      }
      else if (numHackThreads > 0) {
        deployFromHosts(ns, { targetServerName, hostServers, scriptName: 'hack.js', numThreads: numHackThreads });
        deployFromHosts(ns, { targetServerName, hostServers, scriptName: 'weaken.js', numThreads: numWeakeningThreadsFromHack });
      }
    }
    await ns.sleep(1000);
  }
}

// /** @param {NS} ns */
// const getHackability = (ns: NS, serverName: string) => {
//   const serverMoney = ns.getServerMaxMoney(serverName);
//   const serverSecurity = ns.getServerMinSecurityLevel(serverName);
//   const serverGrowthRate = ns.getServerGrowth(serverName);

//   return serverMoney * serverGrowthRate / serverSecurity;
// }

/** @param {NS} ns */
const deployFromHosts = (ns: NS, attackInfo: { numThreads: number, hostServers: string[], targetServerName: string, scriptName: string }) => {
  const { hostServers } = attackInfo;
  let { numThreads } = attackInfo;
  if (numThreads === 0) {
    return true;
  }
  for (const hostServerName of hostServers) {
    const threadsUsed = attackTarget(ns, { ...attackInfo, hostServerName });
    numThreads -= threadsUsed;
    if (numThreads <= 0) {
      return true;
    }
  }
  return false;
}

/** @param {NS} ns */
const attackTarget = (ns: NS, attackInfo: { targetServerName: string, hostServerName: string, numThreads: number, scriptName: string }) => {
  const { targetServerName, hostServerName, numThreads, scriptName } = attackInfo;
  if (hostServerName !== 'home') {
    ns.scp(scriptName, hostServerName, 'home');
  }
  const scriptRamCost = ns.getScriptRam(scriptName, hostServerName);
  const maxRam = Math.max(ns.getServerMaxRam(hostServerName) - (hostServerName === 'home' ? 64 : 0), 0);
  const freeRam = Math.max(maxRam - ns.getServerUsedRam(hostServerName), 0);
  const possibleThreads = Math.floor(freeRam / scriptRamCost);

  const threadsToDeploy = Math.min(numThreads, possibleThreads);

  const stockInfluence = getStockInfluence(ns, attackInfo);

  // for (let i = 1; i <= threadsToDeploy; i++){

  // }

  if (threadsToDeploy > 0) {
    ns.exec(scriptName, hostServerName, threadsToDeploy, targetServerName, stockInfluence);
  }
  return threadsToDeploy;
}

/** @param {NS} ns */
const getStockInfluence = (ns: NS, attackInfo: { targetServerName: string, scriptName: string }) => {
  const { targetServerName, scriptName } = attackInfo;

  const hasStockApiAccess = ns.stock.has4SDataTIXAPI();

  if (!hasStockApiAccess) {
    return false;
  }

  const serverInfo = getServerStockMap();

  const stockSymbol = serverInfo.find(element => element.serverName === targetServerName)?.stockSymbol;

  if (stockSymbol === undefined) {
    return false;
  }

  const forecast = ns.stock.getForecast(stockSymbol);

  if (scriptName === 'hack.js') {
    return forecast < 0.5;
  }

  if (scriptName === 'grow.js') {
    return forecast > 0.5;
  }

  return false;
}

const getServerStockMap = () => {
  return [
    { stockSymbol: 'AERO', companyName: 'AeroCorp', serverName: 'aerocorp' },
    { stockSymbol: 'APHE', companyName: 'Alpha Enterprises', serverName: 'alpha-ent' },
    { stockSymbol: 'BLD', companyName: 'Blade Industries', serverName: 'blade' },
    { stockSymbol: 'CLRK', companyName: 'Clarke Incorporated', serverName: 'clarkinc' },
    { stockSymbol: 'CTK', companyName: 'CompuTek', serverName: 'comptek' },
    { stockSymbol: 'CTYS', companyName: 'Catalyst Ventures', serverName: 'catalyst' },
    { stockSymbol: 'DCOMM', companyName: 'DefComm', serverName: 'defcomm' },
    { stockSymbol: 'ECP', companyName: 'ECorp', serverName: 'ecorp' },
    { stockSymbol: 'FLCM', companyName: 'Fulcrum Technologies', serverName: 'fulcrumassets' },
    { stockSymbol: 'FNS', companyName: 'FoodNStuff', serverName: 'foodnstuff' },
    { stockSymbol: 'FSIG', companyName: 'Four Sigma', serverName: '4sigma' },
    { stockSymbol: 'GPH', companyName: 'Global Pharmaceuticals', serverName: 'global-pharm' },
    { stockSymbol: 'HLS', companyName: 'Helios Labs', serverName: 'helios' },
    { stockSymbol: 'ICRS', companyName: 'Icarus Microsystems', serverName: 'icarus' },
    { stockSymbol: 'JGN', companyName: 'Joe\'s Guns', serverName: 'joesguns' },
    { stockSymbol: 'KGI', companyName: 'KuaiGong International', serverName: 'kuai-gong' },
    { stockSymbol: 'LXO', companyName: 'LexoCorp', serverName: 'lexo-corp' },
    { stockSymbol: 'MDYN', companyName: 'Microdyne Technologies', serverName: 'microdyne' },
    { stockSymbol: 'MGCP', companyName: 'MegaCorp', serverName: 'megacorp' },
    { stockSymbol: 'NTLK', companyName: 'NetLink Technologies', serverName: 'netlink' },
    { stockSymbol: 'NVMD', companyName: 'Nova Medical', serverName: 'nova-med' },
    { stockSymbol: 'OMGA', companyName: 'Omega Software', serverName: 'omega-net' },
    { stockSymbol: 'OMN', companyName: 'Omnia Cybersystems', serverName: 'omnia' },
    { stockSymbol: 'OMTK', companyName: 'OmniTek Incorporated', serverName: 'omnitek' },
    { stockSymbol: 'RHOC', companyName: 'Rho Contruction', serverName: 'rho-construction' },
    { stockSymbol: 'SGC', companyName: 'Sigma Cosmetics', serverName: 'sigma-cosmetics' },
    { stockSymbol: 'SLRS', companyName: 'Solaris Space Systems', serverName: 'solaris' },
    { stockSymbol: 'STM', companyName: 'Storm Technologies', serverName: 'stormtech' },
    { stockSymbol: 'SYSC', companyName: 'SysCore Securities', serverName: 'syscore' },
    { stockSymbol: 'TITN', companyName: 'Titan Laboratories', serverName: 'titan-labs' },
    { stockSymbol: 'UNV', companyName: 'Universal Energy', serverName: 'univ-energy' },
    { stockSymbol: 'VITA', companyName: 'VitaLife', serverName: 'vitalife' },
    { stockSymbol: 'WDS', companyName: 'Watchdog Security', serverName: '' }
  ]
}