import _ from 'lodash'
import * as bitburner from "./NetscriptDefinitions";

export { };

/**
 * Global declarations for the project.
 */
declare global {
    const _: typeof _

    /**
     * An interface extending the `bitburner.NS` interface.
     */
    interface NS extends bitburner.NS { }

    /**
     * Type definition for autocomplete configuration.
     * It is an array of key-value pairs, where the key is a string and the value can be a string, number, boolean, or an array of strings.
     */
    type AutocompleteConfig = [string, string | number | boolean | string[]][];

    /**
     * Interface representing autocomplete data.
     * It contains arrays of servers, txts, scripts, and a function to retrieve flags based on a given configuration.
     */
    interface AutocompleteData {
        servers: string[],
        txts: string[],
        scripts: string[],
        flags: (config: AutocompleteConfig) => any
    }


    type AsyncFunction<T> = (...args: any[]) => Promise<any>;

    /**
     * Type definition for a hacking record.
     * It consists of a host string and the response, 
     * which is the awaited result of a function call of function type T.
     */

    type HackingRecord<T extends AsyncFunction<any>> = {
        /**
         * Host name of targeted server.
         */
        host: string;
        /**
         * Callback response.
         */
        response: Awaited<ReturnType<T>>;
    }
}
