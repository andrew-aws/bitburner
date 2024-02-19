import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
    while (true) {
        await ns.sleep(100);
        managerHacknetServers(ns);
        spendHashes(ns);
    }
}

const managerHacknetServers = (ns: NS) => {
    const { hacknet } = ns;
    const numHacknetNodes = hacknet.numNodes();
    const maxHacknetNodes = hacknet.maxNumNodes();

    const newNodeCost = hacknet.getPurchaseNodeCost();

    const currentMoney = ns.getPlayer().money;

    if (currentMoney > newNodeCost && numHacknetNodes < maxHacknetNodes) {
        hacknet.purchaseNode();
    }

    const upgradeThreshold = 0.4 * newNodeCost;

    for (let nodeNumber = 0; nodeNumber < hacknet.numNodes(); nodeNumber++) {
        const cacheUpgradeCost = hacknet.getCacheUpgradeCost(nodeNumber);
        const coreUpgradeCost = hacknet.getCoreUpgradeCost(nodeNumber);
        const ramUpgradeCost = hacknet.getRamUpgradeCost(nodeNumber);
        const levelUpgradeCost = hacknet.getLevelUpgradeCost(nodeNumber);

        if (ns.getPlayer().money > cacheUpgradeCost && cacheUpgradeCost < upgradeThreshold) {
            hacknet.upgradeCache(nodeNumber);
        }

        if (ns.getPlayer().money > coreUpgradeCost && coreUpgradeCost < upgradeThreshold) {
            hacknet.upgradeCore(nodeNumber);
        }

        if (ns.getPlayer().money > ramUpgradeCost && ramUpgradeCost < upgradeThreshold) {
            hacknet.upgradeRam(nodeNumber);
        }

        if (ns.getPlayer().money > levelUpgradeCost && levelUpgradeCost < upgradeThreshold) {
            hacknet.upgradeLevel(nodeNumber);
        }
    }

}

const spendHashes = (ns: NS) => {

    const { hacknet } = ns;
    const numHashes = hacknet.numHashes();

    const upgradeName = 'Sell for Money'
    const upgradeCost = hacknet.hashCost(upgradeName);

    if (numHashes > upgradeCost) {
        hacknet.spendHashes(upgradeName);
    }
}