/** @param {NS} ns */
export async function main(ns: NS): Promise<number> {
  if (ns.args.length < 3) {
    return 0
  }

  const [target, stockInfluence, delay] = ns.args as [string, boolean, number];

  await ns.sleep(delay);

  // ns.tprint('Growing  ',target)

  const growth = await ns.grow(target, {stock: stockInfluence})
  
  const log = ns.print;
  if (growth > 1) {
    const message = `Grew ${target} by x${ns.formatNumber(growth)}`
    log(message,'success',2000);
  }
  else {
    const message = `Failed to grow ${target}`
    log(message, 'error', 2000)
  }

  return growth

}