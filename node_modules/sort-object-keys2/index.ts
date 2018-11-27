/**
 * Created by user on 2018/4/3/003.
 */

import * as sortObject from './core';
import IOptions = sortObject.IOptions;

const sortObjectKeys = sortObject as typeof sortObject & {
	default: typeof sortObject,
	sortObjectKeys: typeof sortObject,
};

namespace sortObjectKeys
{
	export type IOptions = sortObject.IOptions;
}

sortObjectKeys.default = sortObjectKeys.sortObjectKeys = sortObjectKeys;

export = sortObjectKeys;
