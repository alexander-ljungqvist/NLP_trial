/**
 * Created by user on 2018/4/3/003.
 */
import * as sortObject from './core';
declare const sortObjectKeys: typeof sortObject & {
    default: typeof sortObject;
    sortObjectKeys: typeof sortObject;
};
declare namespace sortObjectKeys {
    type IOptions = sortObject.IOptions;
}
export = sortObjectKeys;
