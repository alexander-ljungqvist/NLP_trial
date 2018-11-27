declare function deepmerge<T1, T2>(x: T1, y: T2, options?: deepmerge.Options): Partial<T1 & T2>;
declare function deepmerge<T>(x: Partial<T>, y: Partial<T>, options?: deepmerge.Options): Partial<T>;
declare namespace deepmerge {
    interface ICache {
        key?: any;
        source?: any;
        target?: any;
        destination?: any;
    }
    interface Options {
        clone?: boolean;
        arrayMerge?(destination: any[], source: any[], options?: Options): any[];
        isMergeableObject?(value: any, isMergeableObject: (value) => boolean, optionsArgument?: Options, key?: any): void;
        isMergeableObject?(value: any, isMergeableObject: (value) => boolean, optionsArgument?: Options, key?: any): boolean;
        keyValueOrMode?: boolean;
    }
    const isMergeable: (value) => boolean;
    const SYMBOL_IS_MERGEABLE: unique symbol;
    const all: <T, T2 = any>(array: Partial<T2 & T>[], optionsArgument?: Options) => T2 & T;
}
export = deepmerge;
declare global  {
    interface Window {
        deepmerge<T>(x: Partial<T>, y: Partial<T>, options?: deepmerge.Options): T;
        deepmerge<T1, T2>(x: T1, y: T2, options?: deepmerge.Options): T1 & T2;
    }
}
