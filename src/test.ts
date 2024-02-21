export async function main(ns: NS): Promise<void> {
    for (let i=0; i<100; i++){
        ns.tprint(`${i} ${isEven(i)}`);

    }
}

const isEven = (number: number): boolean => {
    if (number === 0) {
        return true;
    }

    const normNumber = Math.abs(number);

    return !isEven(normNumber - 1);
}