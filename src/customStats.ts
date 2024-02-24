import { getPortfolioValue } from 'getPortfolioValue'
import { getServerLoad } from 'serverLoad'

/** @param {NS} ns **/
export async function main(ns: NS): Promise<void> {
  const doc = document;
  const hook0 = doc.getElementById('overview-extra-hook-0');
  const hook1 = doc.getElementById('overview-extra-hook-1');

  if (hook0 === null || hook1 === null) {
    return;
  }
  while (true) {
    await ns.sleep(100);
    try {
      const headers = [];
      const values = [];

      headers.push("Time");
      const date = new Date();
      values.push(date.toLocaleTimeString());

      const serverLoad = await getServerLoad(ns);
      headers.push("Server Load");
      values.push(ns.formatPercent(serverLoad.load));

      const portfolioValue = await getPortfolioValue(ns);
      if (portfolioValue) {
        headers.push("Stocks");
        values.push('$' + ns.formatNumber(portfolioValue));
      }

      if (ns.gang.inGang()) {
        const gangMoney = ns.gang.getGangInformation().moneyGainRate;
        if (gangMoney) {
          headers.push('Gang Income');
          values.push(`$${ns.formatNumber(gangMoney)}`);
        }
      }

      const hashRate = getHashRate(ns)
      if (hashRate) {
        headers.push('Hash Rate');
        values.push(`${ns.formatNumber(hashRate)}`);
      }
      
      const hashes = ns.hacknet.numHashes();
      if (hashes > 0 && hashRate < 4) {
        headers.push('Hashes');
        values.push(`${ns.formatNumber(hashes)}`);
      }
      
      // const karma = ns.heart.break();
      // if (karma) {
      //   headers.push('Karma');
      //   values.push(`${ns.formatNumber(karma)}`);
      // }


      // Now drop it into the placeholder elements
      hook0.innerText = headers.join(" \n");
      hook1.innerText = values.join("\n");
      ns.atExit(() => {
        hook0.innerText = '';
        hook1.innerText = '';
      })
    } catch (err) { // This might come in handy later
      ns.print("ERROR: Update Skipped: " + String(err));
    }
  }
}

const getHashRate = (ns: NS): number => {
  const {hacknet} = ns;

  const numHacknetServers = hacknet.numNodes();

  const hacknetProduction = [...Array(numHacknetServers).keys()].map(
    (hacknetIndex: number) => hacknet.getNodeStats(hacknetIndex).production
  )
  .reduce(
    (accumulator: number, currentValue: number) => accumulator + currentValue, 0
  )


  return hacknetProduction;
}