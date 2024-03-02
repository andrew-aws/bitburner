/** @param {NS} ns */
export async function main(ns: NS): Promise<number> {
  if (ns.args.length < 1) {
    return 0
  }

  const target = ns.args[0] as string;

  // ns.tprint('Weakening  ',target)

  const weakening = await ns.weaken(target);

  // if (weakening > 0) {
  //   const message = `Weakened ${target} by ${ns.formatNumber(weakening)}`
  //   ns.toast(message, 'success', 2000);

  // }
  // else {
  //   const message = `Failed to weaken ${target}`
  //   ns.toast(message, 'error', 2000);
  // }


  return weakening;

}