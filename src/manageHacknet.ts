import { NS } from '@ns'
import { managerHacknetServers } from '/hacknet';


export async function main(ns : NS) : Promise<void> {
    while(true) {
        await ns.sleep(100);
        managerHacknetServers(ns);
    }
    return;
}