/** @param {NS} ns */
export async function main(ns: NS) {
  if (ns.args.length < 1) {
    return 0
  }

  const [target, stockInfluence] = ns.args as [string, boolean];

  // ns.tprint('Growing  ',target)

  // const targetMoney = ns.getServerMoneyAvailable(target);

  const growth = await ns.grow(target, {stock: stockInfluence})

  // if (growth > 1) {
  //   const message = `Grew ${target} by x${ns.formatNumber(growth)}`
  //   ns.toast(message,'success',2000);
  // }
  // else {
  //   const message = `Failed to grow ${target}`
  //   ns.toast(message, 'error', 2000)
  // }

  return growth

}