import { NS } from '@ns'
import { getAllHackableServers, getHackability } from '/checkServers';

export async function main(ns: NS): Promise<void> {
    while (true) {
        await ns.sleep(10);
        // managerHacknetServers(ns);
        await spendHashes(ns);
    }
}

export function managerHacknetServers(ns: NS): void {
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
                // ns.toast(`Upgrading hacknet-server-${nodeNumber} cache`, 'info')
                hacknet.upgradeCache(nodeNumber);
            }
        }

        if (ns.getPlayer().money > coreUpgradeCost && coreUpgradeCost < upgradeThreshold) {
            // ns.toast(`Upgrading hacknet-server-${nodeNumber} cores`, 'info')
            hacknet.upgradeCore(nodeNumber);
        }

        if (ns.getPlayer().money > levelUpgradeCost && levelUpgradeCost < upgradeThreshold) {
            // ns.toast(`Upgrading hacknet-server-${nodeNumber} level`, 'info')
            hacknet.upgradeLevel(nodeNumber);
        }

        if (ns.getPlayer().money > ramUpgradeCost && ramUpgradeCost < upgradeThreshold) {
            // ns.toast(`Upgrading hacknet-server-${nodeNumber} ram`, 'info')
            hacknet.upgradeRam(nodeNumber);
        }
    }

}

const spendHashes = async (ns: NS) => {
    for (const callback of [reduceSecurity, raiseMoneyCap, improveStudying]) {
        const moneyThreshold = 0;
        if (ns.getPlayer().money > moneyThreshold) {
            if (await callback(ns)) {
                return true;
            }
        }

    }
    if (sellForMoney(ns)) {
        return true;
    }


    return false;

}

const improveStudying = (ns: NS) => {
    return false;
    const { hacknet } = ns;
    const numHashes = hacknet.numHashes();
    const upgradeName = 'Improve Studying'
    const upgradeCost = hacknet.hashCost(upgradeName);

    if (numHashes > upgradeCost) {
        hacknet.spendHashes(upgradeName);
        ns.toast(`Improving Studying`, 'info');
        return true;
    }


    return false;
}

const reduceSecurity = async (ns: NS) => {
    const targets = (await getAllHackableServers(ns))
        .filter(serverName => ns.getServerMinSecurityLevel(serverName) > 1.1)


    const target = targets[0];

    const { hacknet } = ns;
    const numHashes = hacknet.numHashes();
    const upgradeName = 'Reduce Minimum Security'
    const upgradeCost = hacknet.hashCost(upgradeName);

    if (numHashes > upgradeCost) {
        hacknet.spendHashes(upgradeName, target);
        ns.toast(`Reducing ${target} minimum security`, 'info');
        return true;
    }

    return false;
}

const raiseMoneyCap = async (ns: NS) => {
    const targets = (await getAllHackableServers(ns))
        .filter(serverName => ns.getServerMaxMoney(serverName) < 1e12 && ns.getServerMaxMoney(serverName) > 0)


    const target = targets[0];

    const { hacknet } = ns;
    const numHashes = hacknet.numHashes();
    const upgradeName = 'Increase Maximum Money'
    const upgradeCost = hacknet.hashCost(upgradeName);

    if (numHashes > upgradeCost) {
        hacknet.spendHashes(upgradeName, target);
        ns.toast(`Increasing ${target} maximum money`, 'info');
        return true;
    }

    return false;
}

const sellForMoney = (ns: NS) => {
    const { hacknet } = ns;
    const upgradeName = 'Sell for Money'
    const upgradeCost = hacknet.hashCost(upgradeName);
    const numHashes = hacknet.numHashes();
    const numAfforadableUpgrades = Math.floor(numHashes / upgradeCost);

    const hashCapacity = hacknet.hashCapacity();
    const hashThreshold = 0 * hashCapacity;

    if (hashThreshold <= numHashes && numAfforadableUpgrades > 0) {
        hacknet.spendHashes(upgradeName, '', numAfforadableUpgrades);
        return true;
    }

    return false;

}

// const getTotalProduction = (ns: NS) => {
//     const numHacknetServers = ns.hacknet.numNodes();

//     const totalProduction = [...Array(numHacknetServers).keys()]
//         .map(serverNumber => ns.hacknet.getNodeStats(serverNumber).production)
//         .reduce((accumulator, currentValue) => accumulator + currentValue, 0)

//     return totalProduction;
// }