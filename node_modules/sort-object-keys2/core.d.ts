declare function sortObject<T>(object: T, options?: sortObject.IOptions & {
    useSource: true;
}): T;
declare function sortObject<T>(object: T, options?: sortObject.IOptions & {
    keys: string[];
    onlyKeys: true;
}): Partial<T>;
declare function sortObject<T>(object: T, options?: sortObject.IOptions): Partial<T>;
declare function sortObject<T>(object: T, sortFn: (a, b) => any): Partial<T>;
declare function sortObject<T>(object: T, sortWith: string[]): Partial<T>;
declare module sortObject {
    interface IOptions {
        /**
         * key order
         */
        keys?: string[];
        /**
         * return Object only keys
         * will disable useSource
         */
        onlyKeys?: boolean;
        /**
         * sort callback
         *
         * @param a
         * @param b
         * @returns {any}
         */
        sort?: (a, b) => any;
        /**
         * return reversed Object
         */
        desc?: boolean;
        allowNotExists?: boolean;
        /**
         * return source Object
         */
        useSource?: boolean;
    }
}
export = sortObject;
