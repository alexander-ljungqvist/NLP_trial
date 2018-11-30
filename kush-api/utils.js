'use strict';

const Promise = require('bluebird');
const moment = require('moment');

exports.extend = function(destination, source) {
  var res = JSON.parse(JSON.stringify(destination));
  for (var prop in destination) {
    if (destination.hasOwnProperty(prop) && source.hasOwnProperty(prop)) {
      res[prop] = source[prop];
    }
  }

  return res;
};

exports.merge = (a, b) => Object.assign({}, a, b);

exports.assign = (obj, field, val) => {
  obj[field] = val;
  return obj;
}

exports.extractPropertiesFromConnectors = function(property, connectors, extraProps) {
  return new Promise(function(resolve) {
    var list = [];
    connectors.forEach(function(connector) {
      var object = {};
      object._id = connector[property];
      if (extraProps) {
        extraProps.forEach(function(prop) {
          object[prop] = connector[prop];
        });
      }

      list.push(object);
    });

    return resolve(list);
  });
};

exports.extractPropertyFromList = function(property) {
  return function(items) {
    return new Promise(function(resolve) {
      var list = [];
      items.forEach(function(item) {

        list.push(item[property]);
      });

      return resolve(list);
    });
  };
};

exports.matchListAndObjectIds = function(list) {
  return function(objects) {
    return new Promise(function(resolve) {
      var items = [];
      objects.forEach(function(object) {
        list.some(function(item) {
          if (object._id === item._id) {
            items.push(mergeProperties(object, item));
            return true;
          }

        });
      });

      Promise.all(items)
        .then(resolve);
    });
  };
};

exports.sortListByProperty = function(list, prop) {
  list.sort(function(a, b) {
    if (a[prop] >= b[prop]) {
      return 1;
    }

    if (a[prop] < b[prop]) {
      return -1;
    }

  });

  return list;
};

/*
 * DESCRIPTION:
 * Sorts the given array of objects by the given property/properties (in order)
 *
 * @Param prop: a sting or an array containing strings, to sort by in order
 * @Param list: the array of objects to sort
 *
 * USAGE:
 * @prop can be either a string or an array (ex: ["first", "second"])
 * By default the order is ascending but this can be reversed by adding a neggation
 * at position 0 of the string property, ex: "-first" (note that this is after type forcing)
 *
 * You can tell the sorting function to use the indexed value of a property as a Date by
 * appending "date" in front of the property, ex: "date:first"
 *
 * The order of the property settings is in total as follows: <type>:<negation><name>
 * Adavnced example: ["first", "-second", "date:-third"]
 *
 */
exports.advancedSortListByProperty = function(prop) {

    (function() {
        if (typeof Object.defineProperty === 'function') {
            try { Object.defineProperty(Array.prototype, 'sortBy', { value: sb }); } catch (e) {}
        }
        if (!Array.prototype.sortBy) Array.prototype.sortBy = sb;

        function sb(f) {
            for (var i = this.length; i;) {
                var o = this[--i];
                this[i] = [].concat(f.call(o, o, i), o);
            }

            this.sort(function(a, b) {
                for (var i = 0, len = a.length; i < len; ++i) {
                    if (a[i] != b[i]) return a[i] < b[i] ? -1 : 1;
                }

                return 0;
            });

            for (var i = this.length; i;) {
                this[--i] = this[i][this[i].length - 1];
            }

            return this;
        }
    })();

    function getValue(prop, obj) {
        var parts = prop.split(":");
        var negated = parts[1] ? isNegated(parts[1]) : isNegated(parts[0]);
        var prop = parts[1] ? parts[1] : parts[0];
        prop = negated ? prop.substring(1, prop.length) : prop;
        var value = obj[prop];

        if (parts.length === 1) {
            return getNormalValue(value, negated);
        }

        return getTypeValue(value, parts[0], negated);
    }

    function isNegated(prop, value) {
        return prop[0] === '-';
    }

    function getTypeValue(value, type, negated) {
        switch (type) {
            case "date": {
            return getDateValue(value, negated);
            }
                
            default: {
             // TODO: Throw undefined type error
            return getNormalValue(value, negated)
            }
        }
    }

    function getDateValue(value, negated) {
        var date = !value ? moment.utc() : moment.utc(value);
        return negated ? -date.valueOf() : date.valueOf();
    }

    function getNormalValue(value, negated) {
        return negated ? -value : value;
    }

    // MAIN FUNCTION

    return function(list) {
        return new Promise(function(resolve) {
            list.sortBy(function(o) {
                var fields = [].concat(prop).map(function(p) {
                    return getValue(p, o);
                });

                return fields;
            });

            return resolve(list);
        });
    };
};

exports.rejectIfEmpty = function(body) {
  return function(list) {
    return new Promise(function(resolve, reject) {
      if (list.length <= 0) {
        return reject();
      } else {
        return resolve(body);
      }
    });
  };
};

exports.objectContainsOneOfFields = function(object, fields) {
  return new Promise(function(resolve, reject) {
    var contains = false;
    for (var field in object) {
      if (fields.indexOf(field) >= 0) {
        contains = true;
      }
    }

    resolve(contains);
  });
};

exports.extractRelevantAttributes = function(relevantAttributes) {
  return function(presentAttributes) {
    return new Promise(function(resolve, reject) {
      if (presentAttributes.length <= 0) {
        return reject();
      }

      var list = [];
      presentAttributes.forEach(function(presentAttribute) {
        if (relevantAttributes.indexOf(presentAttribute.name) >= 0) {
          list.push(presentAttribute);
        }
      });

      return Promise.all(list)
        .then(resolve);
    });
  };
};

exports.getQueryByObject = function(queryObject) {
  if (!queryObject) {
    return '';
  }

  var queryString = '?';
  for (var queryParam in queryObject) {
    if (queryObject.hasOwnProperty(queryParam)) {
      queryString += queryParam + '=' + queryObject[queryParam] + '&';
    }
  }

  return queryString;
};

exports.createQueryObjectFromList = function(newFieldName, OldFieldName) {
  return function(list) {
    return new Promise(function(resolve) {
      var res = {};
      res[newFieldName] = list[0][OldFieldName];
      return resolve(res);
    });
  };
};

exports.returnFirstIndex = function(list) {
  return new Promise(function(resolve) {
    return resolve(list[0]);
  });
};

exports.setIdOnBody = function(id) {
  return function(body) {
    return new Promise(function(resolve, reject) {
      body._id = id;
      return resolve(body);
    });
  };
};

exports.setEntityProperties = function(body, template) {
  return function(entity) {
    entity = exports.extend(template, entity);
    entity = exports.extend(entity, body);
    return entity;
  };
};

exports.mapEntitiesByField = function(field) {
  return function(entities) {
    return Promise.reduce(entities, function(map, entity) {
      map[entity[field]] = entity;
      return map;
    }, {});
  };
};

exports.groupEntitiesByField = function(field) {
  return function(entities) {
    return Promise.reduce(entities, function(map, entity) {
      map[entity[field]] = map[entity[field]] ? map[entity[field]] : [];
      map[entity[field]].push(entity);
      return map;
    }, {});
  };
};

exports.mapContainsEntityField = function(map, field) {
  return function(entity) {
    return !!map[entity[field]];
  };
};

exports.extractValueFromMap = function(map) {
  return function(key) {
    return map[key];
  }
};

exports.extractFieldFromObject = function(key) {
  return function(obj) {
    return obj[key];
  }
}

exports.setFieldForObject = function(object, fieldName) {
  return function(field) {
    return new Promise(function(resolve) {
      object[fieldName] = field;
      return resolve(object);
    });
  };
};

exports.listContainsObjectByField = function(list, field) {
  return function(object) {
    for (var i = list.length - 1; i >= 0; i--) {
      if(list[i][field] === object[field]){
        return true;
      }
    }
    
    return false;
  }
}

// HELPER
// ============================================================================

function listContainsId(list, id) {
  return list.indexOf(id) > -1;
}

function mergeProperties(from, to) {
  return new Promise(function(resolve) {
    for (var prop in from) {
      if (from.hasOwnProperty(prop)) {
        to[prop] = from[prop];
      }
    }

    return resolve(to);
  });
}
