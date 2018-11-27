"use strict";
const isMergeableObject = require("is-mergeable-object");
function emptyTarget(val) {
    return Array.isArray(val) ? [] : {};
}
function cloneUnlessOtherwiseSpecified(value, optionsArgument, tmp) {
    let clone = !optionsArgument || optionsArgument.clone !== false;
    let bool = clone && _isMergeableObject(value, optionsArgument, tmp);
    let ret = (bool)
        ? deepmerge(emptyTarget(value), value, optionsArgument)
        : value;
    if (optionsArgument && optionsArgument.keyValueOrMode && !bool && tmp && ('key' in tmp)) {
        if (tmp.destination) {
            ret = tmp.destination[tmp.key] || ret;
        }
        if (tmp.target) {
            ret = tmp.target[tmp.key] || ret;
        }
        if (tmp.source) {
            ret = tmp.source[tmp.key] || ret;
        }
    }
    return ret;
}
function _isMergeableObject(value, optionsArgument, tmp) {
    let ret;
    if (optionsArgument && optionsArgument.isMergeableObject) {
        ret = optionsArgument.isMergeableObject(value, isMergeableObject, optionsArgument, tmp);
    }
    if (ret === null || typeof ret === 'undefined') {
        if (value && (typeof value[deepmerge.SYMBOL_IS_MERGEABLE] == 'boolean')) {
            ret = value[deepmerge.SYMBOL_IS_MERGEABLE];
        }
        else {
            ret = isMergeableObject(value);
        }
    }
    return ret;
}
function defaultArrayMerge(target, source, optionsArgument) {
    return target.concat(source).map(function (element, index, array) {
        return cloneUnlessOtherwiseSpecified(element, optionsArgument, {
            key: index,
        });
    });
}
function mergeObject(target, source, optionsArgument) {
    let destination = {};
    if (_isMergeableObject(target, optionsArgument)) {
        Object.keys(target).forEach(function (key) {
            destination[key] = cloneUnlessOtherwiseSpecified(target[key], optionsArgument, {
                key,
                source,
                target,
                destination,
            });
        });
    }
    Object.keys(source).forEach(function (key) {
        if (!_isMergeableObject(source[key], optionsArgument, {
            key,
            source,
            target,
        }) || !target[key]) {
            destination[key] = cloneUnlessOtherwiseSpecified(source[key], optionsArgument, {
                key,
                source,
                target,
            });
        }
        else {
            destination[key] = deepmerge(target[key], source[key], optionsArgument);
        }
    });
    return destination;
}
function deepmerge(target, source, optionsArgument) {
    let sourceIsArray = Array.isArray(source);
    let targetIsArray = Array.isArray(target);
    let options = optionsArgument || { arrayMerge: defaultArrayMerge };
    let sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;
    if (!sourceAndTargetTypesMatch) {
        return cloneUnlessOtherwiseSpecified(source, optionsArgument, {
            target,
            source,
        });
    }
    else if (sourceIsArray) {
        let arrayMerge = options.arrayMerge || defaultArrayMerge;
        return arrayMerge(target, source, optionsArgument);
    }
    else {
        return mergeObject(target, source, optionsArgument);
    }
}
(function (deepmerge) {
    deepmerge.isMergeable = isMergeableObject;
    deepmerge.SYMBOL_IS_MERGEABLE = Symbol.for('SYMBOL_IS_MERGEABLE');
    deepmerge.all = function deepmergeAll(array, optionsArgument) {
        if (!Array.isArray(array)) {
            throw new Error('first argument should be an array');
        }
        return array.reduce(function (prev, next) {
            return deepmerge(prev, next, optionsArgument);
        }, {});
    };
})(deepmerge || (deepmerge = {}));
module.exports = deepmerge;
