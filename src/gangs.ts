/** @param {NS} ns */
export async function main(ns: NS) {

  while (true) {

    setTasks(ns);
    manageEquipment(ns);


    // return 
    await ns.gang.nextUpdate();
  }
}

/** @param {NS} ns */
const setTasks = (ns: NS) => {
  const { gang } = ns;
  
  const taskName = decideTask(ns);

  const names = gang.getMemberNames();
  for (const name of names) {
    gang.setMemberTask(name, taskName);
  }

  return names.map(name => gang.getAscensionResult(name));
}

/** @param {NS} ns */
const decideTask = (ns: NS) => {
  const wantedPenaltyThreshold = 0.0995;
  const powerThreshold = 5000;
  const gangInfo = ns.gang.getGangInformation();

  const gangWantedPenalty = gangInfo.wantedPenalty;
  const gangPower = gangInfo.power;

  if (gangWantedPenalty < wantedPenaltyThreshold){
    return 'Vigilante Justice';
  }

  if (gangPower < powerThreshold) {
    return 'Territory Warfare';
  }

  return 'Human Trafficking';

}

/** @param {NS} ns */
const manageEquipment = (ns: NS) => {
  const { gang } = ns;
  const equipmentNames = gang.getEquipmentNames();
  const gangeMemberNames = gang.getMemberNames();

  for (const memberName of gangeMemberNames) {
    for (const equipmentName of equipmentNames) {
      const upgrades = [
        ...gang.getMemberInformation(memberName).upgrades,
        ...gang.getMemberInformation(memberName).augmentations
      ]
      if (upgrades.includes(equipmentName)) {
        continue;
      }
      const equipmentCost = gang.getEquipmentCost(equipmentName)
      if (ns.getPlayer().money > equipmentCost) {
        ns.toast(`Purchasing ${equipmentName} for ${memberName}`, 'info')
        gang.purchaseEquipment(memberName, equipmentName)
      }
    }
  }
}

