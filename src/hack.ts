/** @param {NS} ns */
export async function main(ns: NS): Promise<number> {
  if (ns.args.length < 3) {
    return 0
  }

  const [target, stockInfluence, delay] = ns.args as [string, boolean, number];

  await ns.sleep(delay);

  // ns.tprint('Hacking  ',target)

  const amountStolen = await ns.hack(target, {stock: stockInfluence})

  const minAmountToReport = 0;
  
  const log = ns.toast;
  if (amountStolen > minAmountToReport) {
    // ns.tprint('Hacked ',target,' for $',ns.formatNumber(amountStolen), ' / $', ns.formatNumber(ns.getServerMaxMoney(target)))
    const message = `Hacked ${target} for $${ns.formatNumber(amountStolen)}`
    log(message, 'success', 2000);
  }
  else if (amountStolen === 0) {
    const message = `Failed to steal from ${target}`
    log(message, 'error', 2000);
  }

  return amountStolen

}