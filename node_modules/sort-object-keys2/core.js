"use strict";
function sortObject(object, sortWith) {
    let options = {};
    if (typeof sortWith === 'function') {
        options.sort = sortWith;
    }
    else if (Array.isArray(sortWith)) {
        options.keys = sortWith;
    }
    else {
        options = Object.assign(options, sortWith);
    }
    let keys = (options.keys || []);
    if (options.onlyKeys) {
        options.useSource = false;
        if ((options.keys || []).length == 0) {
            throw new ReferenceError(`options.key is empty or not exists.`);
        }
    }
    else {
        keys = keys.concat()
            .concat(Object.keys(object).sort(options.sort));
    }
    keys = array_unique(keys);
    if (options.desc) {
        keys = keys.reverse();
    }
    let ret = keys.reduce(function (total, key) {
        if (options.allowNotExists || key in object) {
            total[key] = object[key];
        }
        return total;
    }, {});
    if (options.useSource) {
        Object.keys(ret)
            .forEach(function (key, index, array) {
            delete object[key];
            object[key] = ret[key];
        });
        return object;
    }
    return ret;
}
function array_unique(array) {
    return array.filter(function (el, index, arr) {
        return index == arr.indexOf(el);
    });
}
module.exports = sortObject;
