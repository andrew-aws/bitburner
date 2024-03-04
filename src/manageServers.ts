import { getServerLoad } from 'serverLoad.js'

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
  const ram = 8;
  const serverLoadThreshold = 0.95;

  while (true) {
    await ns.sleep(100)
    const myMoney = ns.getServerMoneyAvailable('home')
    const purchasedServers = ns.getPurchasedServers()
    const maxPurchasedServers = ns.getPurchasedServerLimit()

    const purchaseCost = ns.getPurchasedServerCost(ram)
    const purchaseValue = purchasedServers.length < maxPurchasedServers && myMoney > purchaseCost ? ram / purchaseCost : 0

    const upgradeValues = purchasedServers.map(
      serverName => {
        const server = ns.getServer(serverName)
        const serverRam = server.maxRam
        const targetRam = 2 * serverRam
        const upgradeCost = ns.getPurchasedServerUpgradeCost(serverName, targetRam)
        const upgradeValue = myMoney > upgradeCost ? targetRam / upgradeCost : 0
        return { name: serverName, value: upgradeValue, ram: targetRam }
      }
    )

    const bestUpgradeValue = upgradeValues.length ? Math.max(...upgradeValues.map(server => server.value)) : 0
    const bestUpgradeServer = upgradeValues.find(server => server.value === bestUpgradeValue)

    const serverLoad = await getServerLoad(ns);

    if (serverLoad.load > serverLoadThreshold) {
      if (purchaseValue > bestUpgradeValue) {
        const serverName = 'pserv-' + purchasedServers.length
        const message = ns.vsprintf('Purchasing %s with %s of ram', [serverName, ns.formatRam(ram)])
        ns.toast(message, 'info')
        ns.purchaseServer(serverName, ram)
      }

      if (purchaseValue < bestUpgradeValue && bestUpgradeServer !== undefined) {
        const serverName = bestUpgradeServer.name
        const message = ns.vsprintf('Upgrading %s to %s of ram', [serverName, ns.formatRam(bestUpgradeServer.ram)])
        ns.toast(message, 'info')
        ns.upgradePurchasedServer(serverName, bestUpgradeServer.ram)
      }
    }
  }
}