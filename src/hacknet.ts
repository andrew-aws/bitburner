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

    const upgradeThreshold = 0.1 * newNodeCost;

    for (let nodeNumber = 0; nodeNumber < hacknet.numNodes(); nodeNumber++) {
        const cacheUpgradeCost = hacknet.getCacheUpgradeCost(nodeNumber);
        const coreUpgradeCost = hacknet.getCoreUpgradeCost(nodeNumber);
        const ramUpgradeCost = hacknet.getRamUpgradeCost(nodeNumber);
        const levelUpgradeCost = hacknet.getLevelUpgradeCost(nodeNumber);

        if (ns.getPlayer().money > cacheUpgradeCost && cacheUpgradeCost < upgradeThreshold) {
            if (hacknet.numHashes() / hacknet.hashCapacity() > 0.95) {
                hacknet.upgradeCache(nodeNumber);
            }
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
    const target = 'harakiri-sushi';

    if (reduceSecurity(ns, target)) {
        return true;
    }
    if (raiseMoneyCap(ns, target)) {
        return true;
    }
    if (sellForMoney(ns)) {
        return true;
    }

    return false;

}

const reduceSecurity = (ns: NS, target: string) => {
    const { hacknet } = ns;
    const numHashes = hacknet.numHashes();
    if (ns.getServerMinSecurityLevel(target) > 1) {
        const upgradeName = 'Reduce Minimum Security'
        const upgradeCost = hacknet.hashCost(upgradeName);

        if (numHashes > upgradeCost) {
            hacknet.spendHashes(upgradeName, target);
            return true;
        }
    }

    return false;
}

const raiseMoneyCap = (ns: NS, target: string) => {
    const { hacknet } = ns;
    const numHashes = hacknet.numHashes();
    if (ns.getServerMaxMoney(target) < 1e12) {
        const upgradeName = 'Increase Maximum Money'
        const upgradeCost = hacknet.hashCost(upgradeName);

        if (numHashes > upgradeCost) {
            hacknet.spendHashes(upgradeName, target);
            return true;
        }
    }

    return false;
}

const sellForMoney = (ns: NS) => {
    const { hacknet } = ns;
    const upgradeName = 'Sell for Money'
    const upgradeCost = hacknet.hashCost(upgradeName);
    // const maxHashes = hacknet.hashCapacity();
    const numHashes = hacknet.numHashes();

    if (numHashes > upgradeCost) {
        hacknet.spendHashes(upgradeName);
        return true;
    }

    return false;

}