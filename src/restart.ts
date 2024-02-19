import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    const [scriptName] = ns.args as string[];

    ns.scriptKill(scriptName, 'home');
    ns.run(scriptName);
}