/** @param {NS} ns */
export async function main(ns: NS): Promise<number> {
  if (ns.args.length < 1) {
    return 0
  }

  const [target,, delay] = ns.args as [string, boolean, number];

  await ns.sleep(delay);

  // ns.tprint('Weakening  ',target)

  const weakening = await ns.weaken(target);

  const log = ns.print;
  if (weakening > 0) {
    const message = `Weakened ${target} by ${ns.formatNumber(weakening)}`
    log(message, 'success', 2000);

  }
  else {
    const message = `Failed to weaken ${target}`
    log(message, 'error', 2000);
  }


  return weakening;

}