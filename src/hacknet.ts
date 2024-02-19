/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
  while (true) {
    await ns.sleep(100);
    const hackNet = ns.hacknet
    const numHacknetNodes = hackNet.numNodes()

    const hacknetProduction = [...Array(numHacknetNodes).keys()]
    .map((nodeNumber: number) => {
      const stats = hackNet.getNodeStats(nodeNumber);

      return stats.production;
    })
    .reduce(
      (accumulator: number, currentProduction: number) => accumulator + currentProduction, 0
    )

    const nodePurchaseCost = hackNet.getPurchaseNodeCost()

    if (hackNet.maxNumNodes() >= numHacknetNodes && nodePurchaseCost < ns.getServerMoneyAvailable('home') && nodePurchaseCost < hacknetProduction / 3600){
      hackNet.purchaseNode()
    }

    for (let nodeNumber = 0; nodeNumber < numHacknetNodes; nodeNumber++) {
      const coreCost = hackNet.getCoreUpgradeCost(nodeNumber, 1)
      const ramCost = hackNet.getRamUpgradeCost(nodeNumber, 1)
      const levelCost = hackNet.getLevelUpgradeCost(nodeNumber, 1)

      if (coreCost < ns.getServerMoneyAvailable('home')) {
        hackNet.upgradeCore(nodeNumber, 1)
      }
      if (ramCost < ns.getServerMoneyAvailable('home')) {
        hackNet.upgradeRam(nodeNumber, 1)
      }
      if (levelCost < ns.getServerMoneyAvailable('home')) {
        hackNet.upgradeLevel(nodeNumber, 1)
      }
    }

  }
}