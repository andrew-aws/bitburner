import { getAllHackableServers } from 'checkServers'
import { isTargetUnderAttack } from '/utils/isUnderAttack'
import { readServers } from '/utils/readHostsFromPort';

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
  await attackServers(ns)
}

/** @param {NS} ns */
const attackServers = async (ns: NS) => {
  const hackMoneyFraction = 0.1;
  const parallelizationFactor = 5;
  const delayTime = 50;

  while (true) {
    await ns.sleep(1000);
    // const hostServers = await getAllHostServers(ns);
    const targetServers = (await getAllHackableServers(ns))
    // .sort((a,b) => ns.getServerMinSecurityLevel(a) - ns.getServerMinSecurityLevel(b))
    // .slice(0, 4)

    // ns.tprint('Attacking')

    for (const targetServerName of targetServers) {
      // ns.tprint(targetServerName)
      // if (['iron-gym'].includes(targetServerName) === false) {
      //   continue;
      // }

      // if (getServerStockMap().find(serverInfo => serverInfo.serverName === targetServerName) === undefined) {
      //   continue;
      // }

      if (await isTargetUnderAttack(ns, targetServerName)) {
        continue
      }
      // ns.toast(targetServerName);
      
      const server = ns.getServer(targetServerName);
      
      const {
        hackDifficulty: targetSecurity,
        minDifficulty: targetMinSecurity,
        moneyAvailable: targetMoney,
        moneyMax: targetMoneyMax,
      } = server
      
      if (targetSecurity === undefined || targetMoneyMax === undefined || targetMoney === undefined || targetMinSecurity === undefined) {
        continue;
      }

      // const numHackThreads = Math.ceil(ns.hackAnalyzeThreads(targetServerName, hackMoneyFraction * targetMoney));
      const hackPower = ns.formulas.hacking.hackPercent(server, ns.getPlayer());

      const numHackThreads = hackPower === 0 ? 0 : Math.ceil(hackMoneyFraction / hackPower);


      // const numGrowthThreads = Math.ceil(ns.growthAnalyze(targetServerName, Math.ceil(targetMoneyMax / (targetMoney + 1))));
      const numGrowthThreads = ns.formulas.hacking.growThreads(server, ns.getPlayer(), targetMoneyMax);

      const numPredictedGrowthThreads = ns.formulas.hacking.growThreads({ ...server, moneyAvailable: (1 - hackPower * numHackThreads) * targetMoneyMax }, ns.getPlayer(), targetMoneyMax);

      const growthImpact = ns.growthAnalyzeSecurity(numGrowthThreads);
      const predictedGrowthImpact = ns.growthAnalyzeSecurity(numPredictedGrowthThreads);
      const hackImpact = ns.hackAnalyzeSecurity(numHackThreads, targetServerName);

      const targetSecurityDecrease = targetSecurity - targetMinSecurity;
      const weakeningPower = ns.weakenAnalyze(1);
      const numWeakeningThreads = Math.ceil(targetSecurityDecrease / weakeningPower);
      const numWeakeningThreadsFromGrowth = Math.ceil(growthImpact / weakeningPower);
      const numWeakeningThreadsFromPredictedGrowth = Math.ceil(predictedGrowthImpact / weakeningPower);

      const numWeakeningThreadsFromHack = Math.ceil(hackImpact / weakeningPower);

      const weakenTime = ns.getWeakenTime(targetServerName);
      const hackTime = ns.getHackTime(targetServerName);
      const growTime = ns.getGrowTime(targetServerName);

      if (numWeakeningThreads + numGrowthThreads > 0) {
        // ns.tprint('Preparing server')
        // ns.tprint(`${targetServerName.padStart(15)}: Weaken threads: ${numWeakeningThreads} Grow Threads: ${numGrowthThreads} Weaken Threads: ${numWeakeningThreadsFromGrowth}`)
        await deployFromHosts(ns, { targetServerName, scriptName: 'weaken.js', numThreads: numWeakeningThreads, delay: 0 });
        await deployFromHosts(ns, { targetServerName, scriptName: 'grow.js', numThreads: numGrowthThreads, delay: 0 });
        await deployFromHosts(ns, { targetServerName, scriptName: 'weaken.js', numThreads: numWeakeningThreadsFromGrowth, delay: 0 });
      }
      else if (numHackThreads > 0) {
        for (let i = 0; i < parallelizationFactor; i++) {
          await ns.sleep(1)
          // ns.tprint(i)
          // ns.tprint(`${targetServerName.padStart(15)}: Hack threads: ${numWeakeningThreads} Grow Threads: ${numGrowthThreads} Weaken Threads: ${numWeakeningThreadsFromGrowth}`)
          await deployFromHosts(ns, { targetServerName, scriptName: 'hack.js', numThreads: numHackThreads, delay: weakenTime - hackTime + delayTime * i * 4 });
          await deployFromHosts(ns, { targetServerName, scriptName: 'weaken.js', numThreads: numWeakeningThreadsFromHack, delay: delayTime * (1 + i * 4) });
          await deployFromHosts(ns, { targetServerName, scriptName: 'grow.js', numThreads: numPredictedGrowthThreads, delay: (weakenTime - growTime) + delayTime * (2 + i * 4) });
          await deployFromHosts(ns, { targetServerName, scriptName: 'weaken.js', numThreads: numWeakeningThreadsFromPredictedGrowth, delay: delayTime * (3 + i * 4) });
        }
        // ns.tprint(`${targetServerName.padStart(15)}: Hack threads: ${numHackThreads} Weaken Threads: ${numWeakeningThreadsFromHack}`)
      }
    }
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
const deployFromHosts = async (ns: NS, attackInfo: { numThreads: number, targetServerName: string, scriptName: string, delay: number }) => {
  // await ns.sleep(1);
  const hostServers = readServers(ns);
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
const attackTarget = (ns: NS, attackInfo: { targetServerName: string, hostServerName: string, numThreads: number, scriptName: string, delay: number }) => {
  const { targetServerName, hostServerName, numThreads, scriptName, delay } = attackInfo;
  const homeName = 'home';
  if (hostServerName !== homeName) {
    ns.scp(scriptName, hostServerName, homeName);
  }
  const scriptRamCost = ns.getScriptRam(scriptName, hostServerName);
  const maxRam = Math.max(ns.getServerMaxRam(hostServerName) - (hostServerName === homeName ? 64 : 0), 0);
  const freeRam = Math.max(maxRam - ns.getServerUsedRam(hostServerName), 0);
  const possibleThreads = Math.floor(freeRam / scriptRamCost);

  const threadsToDeploy = Math.min(numThreads, possibleThreads);

  const stockInfluence = getStockInfluence(ns, attackInfo);

  // for (let i = 1; i <= threadsToDeploy; i++){

  // }

  if (threadsToDeploy > 0) {
    ns.exec(scriptName, hostServerName, threadsToDeploy, targetServerName, stockInfluence, delay);
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

  // const forecast = ns.stock.getForecast(stockSymbol);

  if (scriptName === 'grow.js') {
    return true;
  }

  // if (scriptName === 'grow.js') {
  //   return forecast > 0.5;
  // }

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