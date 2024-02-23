import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
    while (true) {
        await ns.sleep(10);
        // managerHacknetServers(ns);
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

        const hashCapacity = hacknet.getNodeStats(nodeNumber).cache;
        const hashRate = hacknet.getNodeStats(nodeNumber).production;

        if (ns.getPlayer().money > cacheUpgradeCost && cacheUpgradeCost < upgradeThreshold) {
            if (hashCapacity !== undefined && hashCapacity < 4 * 3600 * hashRate) {
                ns.toast(`Upgrading hacknet-server-${nodeNumber} cache`,'info')
                hacknet.upgradeCache(nodeNumber);
            }
        }
        
        if (ns.getPlayer().money > coreUpgradeCost && coreUpgradeCost < upgradeThreshold) {
            ns.toast(`Upgrading hacknet-server-${nodeNumber} cores`,'info')
            hacknet.upgradeCore(nodeNumber);
        }
        
        if (ns.getPlayer().money > levelUpgradeCost && levelUpgradeCost < upgradeThreshold) {
            ns.toast(`Upgrading hacknet-server-${nodeNumber} level`,'info')
            hacknet.upgradeLevel(nodeNumber);
        }
        
        if (ns.getPlayer().money > ramUpgradeCost && ramUpgradeCost < upgradeThreshold) {
            ns.toast(`Upgrading hacknet-server-${nodeNumber} ram`,'info')
            hacknet.upgradeRam(nodeNumber);
        }
    }

}

const spendHashes = (ns: NS) => {
    const target = 'blade';

    if (ns.getPlayer().skills.hacking > ns.getServerRequiredHackingLevel(target)) {
        if (reduceSecurity(ns, target)) {
            return true;
        }
        if (raiseMoneyCap(ns, target)) {
            return true;
        }
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
            ns.toast(`Reducing ${target} minimum security`, 'info');
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
            ns.toast(`Increasing ${target} maximum money`, 'info');
            return true;
        }
    }

    return false;
}

const sellForMoney = (ns: NS) => {
    const { hacknet } = ns;
    const upgradeName = 'Sell for Money'
    const upgradeCost = hacknet.hashCost(upgradeName);
    const numHashes = ns.hacknet.numHashes();
    const numAfforadableUpgrades = Math.floor(numHashes/upgradeCost);

    if (numAfforadableUpgrades > 0) {
        hacknet.spendHashes(upgradeName, '', numAfforadableUpgrades);
        return true;
    }

    return false;

}