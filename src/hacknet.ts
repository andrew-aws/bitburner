/** @param {NS} ns */
export async function main(ns: NS) {
  while (true) {
    await ns.sleep(100);
    const hackNet = ns.hacknet
    const numHacknetNodes = hackNet.numNodes()

    const nodePurchaseCost = hackNet.getPurchaseNodeCost()

    if (hackNet.maxNumNodes() >= numHacknetNodes && nodePurchaseCost < ns.getServerMoneyAvailable('home')){
      hackNet.purchaseNode()
    }

    for (let nodeNumber = 0; nodeNumber < numHacknetNodes; nodeNumber++) {
      const stats = hackNet.getNodeStats(nodeNumber)
      const coreCost = hackNet.getCoreUpgradeCost(nodeNumber, 1)
      const ramCost = hackNet.getRamUpgradeCost(nodeNumber, 1)
      const levelCost = hackNet.getLevelUpgradeCost(nodeNumber, 1)

      if (coreCost < ns.getServerMoneyAvailable('home') && coreCost < nodePurchaseCost) {
        hackNet.upgradeCore(nodeNumber, 1)
      }
      if (ramCost < ns.getServerMoneyAvailable('home') && ramCost < nodePurchaseCost) {
        hackNet.upgradeRam(nodeNumber, 1)
      }
      if (levelCost < ns.getServerMoneyAvailable('home') && levelCost < nodePurchaseCost) {
        hackNet.upgradeLevel(nodeNumber, 1)
      }
    }

  }
}