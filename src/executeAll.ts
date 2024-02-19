/** @param {NS} ns */
export async function executeFunctionOnAllServers<T extends AsyncFunction<T>>(ns: NS, callback: T): Promise<HackingRecord<T>[]> {
  return accessAllServers(ns, 'home', [], callback);
}

/** @param {NS} ns */
const accessAllServers = async <T extends AsyncFunction<T>>(ns: NS, host: string, responseList: HackingRecord<T>[], callback: T) => {

  if (responseList.some(record => record.host === host)) {
    return responseList;
  }

  const response = await callback(ns, host);
  responseList.push({ host, response });

  const servers = ns.scan(host);

  for (const server of servers) {
    await accessAllServers(ns, server, responseList, callback);
  }

  return responseList;
}
