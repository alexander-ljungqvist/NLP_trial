/**
 * Created by user on 2018/2/28/028.
 */

import * as _deepmerge from './core';

const deepmerge = _deepmerge as typeof _deepmerge & {
	deepmerge: typeof _deepmerge,
	default: typeof _deepmerge,
};

deepmerge.deepmerge = deepmerge;
deepmerge.default = deepmerge;

export = deepmerge;
