/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {

  while (true) {

    recruit(ns);
    setTasks(ns);
    manageEquipment(ns);
    ascend(ns);

    // return 
    await ns.gang.nextUpdate();
  }
}

const recruit = (ns: NS) => {
  const canRecruit = ns.gang.canRecruitMember();
  if (canRecruit){
    const newMemberName = getNewMemberName(ns);
    ns.gang.recruitMember(newMemberName);
    ns.gang.setMemberTask(newMemberName, 'Train Combat');
  }
}

/** @param {NS} ns */
const setTasks = (ns: NS) => {
  const { gang } = ns;
  
  const taskName = decideTask(ns);

  const names = gang.getMemberNames();
  for (const name of names) {
    if (gang.getMemberInformation(name).task.includes('Train') === false){
      gang.setMemberTask(name, taskName);
    }
  }

  return names.map(name => gang.getAscensionResult(name));
}

/** @param {NS} ns */
const decideTask = (ns: NS) => {
  const wantedPenaltyThreshold = 0.9;
  const powerThreshold = 5000;
  const gangInfo = ns.gang.getGangInformation();


  const {wantedPenalty, power, wantedLevel} = gangInfo

  if (wantedPenalty < wantedPenaltyThreshold && wantedLevel > 1){
    return 'Vigilante Justice';
  }

  if (power < powerThreshold) {
    return 'Territory Warfare';
  }

  // return 'Armed Robbery';
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

const ascend = (ns: NS) => {
  const {gang} = ns;

  const memberNames = gang.getMemberNames();

  const ascensionThreshold = 1.5;

  for (const memberName of memberNames){
    const ascensionResult = gang.getAscensionResult(memberName);
    if (ascensionResult === undefined) {
      return;
    }
    const {hack, def, dex, str, cha} = ascensionResult;
    // ascensionResult.

    if (Math.min(hack, str, def, dex, cha) > ascensionThreshold) {
      ns.toast(`Ascending ${memberName}`)
      gang.ascendMember(memberName);
    }

  }
}

const getNewMemberName = (ns: NS) => {
  const possibleNames = [
    'Bill',
    'Ted',
    'Steve',
    'Jack',
    'Tug',
    'Maya',
    'Fred',
    'Hannah',
    'Craig',
    'Kirk',
    'Chris',
    'Bob',
    'Dan',
    'Ken',
    'Beth'
    ]
    const currentNames = ns.gang.getMemberNames();

    return possibleNames.filter(name => currentNames.includes(name) === false)[0]
}

