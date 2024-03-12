/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
  for (let i = 0; i <= 100; i += 1) {
    const percent = i/100
    ns.tprint(`${i}`.padEnd(3) + ' ' + progressBar(percent, 50));
  }
}

/** @param {NS} ns */
export function progressBar(percent: number, size: number): string {
  const bar = '[' + '>'.padStart(Math.ceil(percent * size), '=').padEnd(size, '.') + ']'

  return bar;
}