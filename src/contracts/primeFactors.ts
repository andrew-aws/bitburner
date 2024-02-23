import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    ns.tprint(primeFactor(708071966));
}

const primeFactor = (numberToFactor: number) => {
    for (let i=Math.floor(Math.sqrt(numberToFactor)); i>=1; i--){
        if (isPrime(i)){
            const quotient = numberToFactor/i;
            if (quotient === Math.floor(quotient)){
                return i
            }
        }
    }
    return 0;
}


const isPrime = (num: number) => {
    for (let i=2; i<=Math.sqrt(num); i++){
        const quotient = num/i;
        if (quotient === Math.floor(quotient)){
            return false;
        }
    }
    return true;
}