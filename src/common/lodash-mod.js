"use strict";

/**
 * Lodash extension.
 *
 * See http://eng.rightscale.com/2015/01/22/lodash-extensions.html
 */



//    var _ = require('lodash');
//    var $ = require('jquery');
import '../deps/jquery-deps.js';
import getLog from './getlog.js';
import * as formatting from './formatting.js';

var ensureFunction = function (argument, optionalDescription) {
    if (!_.isFunction(argument)) {
        var message;
        if (optionalDescription) {
            message = 'Argument "' + optionalDescription + '" is not a function: ' + argument;
        } else {
            message = 'Not a function: ' + argument;
        }
        throw new Error(message);
    }
};


var decorateWithDescription = function(baseEnsureFunction) {
    ensureFunction(baseEnsureFunction, "base ensure function");
    if (baseEnsureFunction.description) {
        throw new Error("Base function description already defined.");
    }
    baseEnsureFunction.description = function(description) {
        return function(argument) { baseEnsureFunction(argument, description); };
    };
    return baseEnsureFunction;
};

decorateWithDescription(ensureFunction);


var ensureString = function (argument, optionalDescription) {
    ensureNotUndefined(argument, optionalDescription);
    if (!_.isString(argument)) {
        var message;
        if (optionalDescription) {
            message = 'Argument "' + optionalDescription + '" is not a String: ' + argument;
        } else {
            message = 'Not a String: ' + argument;
        }
        throw new Error(message);
    }
};
decorateWithDescription(ensureString);

var ensureInteger = function (argument, optionalDescription) {
    ensureNotUndefined(argument, optionalDescription);
    if (!_.isInteger(argument)) {
        var message;
        if (optionalDescription) {
            message = 'Argument "' + optionalDescription + '" is not an integer: ' + argument;
        } else {
            message = 'Not an integer: ' + argument;
        }
        throw new Error(message);
    }
};
decorateWithDescription(ensureInteger);

var ensureArray = function (argument, optionalDescription) {
    ensureNotUndefined(argument, optionalDescription);
    if (!_.isArray(argument)) {
        var message;
        if (optionalDescription) {
            message = 'Argument "' + optionalDescription + '" is not an array: ' + argument;
        } else {
            message = 'Not an array: ' + argument;
        }
        throw new Error(message);
    }
};
decorateWithDescription(ensureArray);

var ensureArrayLike = function (argument, optionalDescription) {
    ensureNotUndefined(argument, optionalDescription);
    if (!_.isArrayLike(argument)) {
        var message;
        if (optionalDescription) {
            message = 'Argument "' + optionalDescription + '" is not an array like: ' + argument;
        } else {
            message = 'Not an array like: ' + argument;
        }
        throw new Error(message);
    }
};
decorateWithDescription(ensureArrayLike);

var ensurePositiveInteger = function (argument, optionalDescription) {
    ensureNotUndefined(argument, optionalDescription);
    if (!_.isInteger(argument) || argument < 1) {
        var message;
        if (optionalDescription) {
            message = 'Argument "' + optionalDescription + '" is not a positive integer: ' + argument;
        } else {
            message = 'Not a positive integer: ' + argument;
        }
        throw new Error(message);
    }
};
decorateWithDescription(ensurePositiveInteger);


var ensureNonNegativeInteger = function (argument, optionalDescription) {
    ensureNotUndefined(argument, optionalDescription);
    if (!_.isInteger(argument) || argument < 0) {
        var message;
        if (optionalDescription) {
            message = 'Argument "' + optionalDescription + '" is not a nonnegative integer: ' + argument;
        } else {
            message = 'Not a nonnegative integer: ' + argument;
        }
        throw new Error(message);
    }
};
decorateWithDescription(ensureNonNegativeInteger);


var ensureBoolean = function (argument, optionalDescription) {
    ensureNotUndefined(argument, optionalDescription);
    if (!_.isBoolean(argument)) {
        var message;
        if (optionalDescription) {
            message = 'Argument "' + optionalDescription + '" is not a boolean: ' + argument;
        } else {
            message = 'Not a boolean: ' + argument;
        }
        throw new Error(message);
    }
};
decorateWithDescription(ensureBoolean);



var ensurePositiveFinite = function (argument, optionalDescription) {
    ensureNotUndefined(argument, optionalDescription);
    if (!_.isFinite(argument) || argument <= 0) {
        var message;
        if (optionalDescription) {
            message = 'Argument "' + optionalDescription + '" is not a positive finite number: ' + argument;
        } else {
            message = 'Not a positive finite: ' + argument;
        }
        throw new Error(message);
    }
};
decorateWithDescription(ensurePositiveFinite);



var ensureNotUndefined = function (argument, optionalDescription) {
    if (argument === undefined) {
        var message;
        if (optionalDescription) {
            message = 'Argument "' + optionalDescription + '" expected to be not undefined.';
        } else {
            message = 'Argument undefined.';
        }
        throw new Error(message);
    }
};
decorateWithDescription(ensureNotUndefined);



var ensureUndefinedOr = function (argument, whenDefined, optionalDescription) {
    ensureFunction(whenDefined, 'predicate for the defined case');
    if (argument === undefined) {
        return;
    } else {
        whenDefined(argument, 'Defined case (' + optionalDescription + ')');
    }
};


var ensureUndefined = function (argument, optionalDescription) {
    if (argument !== undefined) {
        var message;
        if (optionalDescription) {
            message = 'Argument "' + optionalDescription + '" expected to be undefined but is: ' + argument;
        } else {
            message = 'Not undefined: ' + argument;
        }
        throw new Error(message);
    }
};
decorateWithDescription(ensureUndefined);
ensureUndefined.or = function(whenDefined) {
    ensureFunction(whenDefined);
    return function(argument, optionalDescription) {
        ensureUndefinedOr(argument, whenDefined, optionalDescription);
    };
};

var ensureNull = function (argument, optionalDescription) {
    if (argument !== null) {
        var message;
        if (optionalDescription) {
            message = 'Argument "' + optionalDescription + '" expected to be null but is: ' + argument;
        } else {
            message = 'Not null: ' + argument;
        }
        throw new Error(message);
    }
};

var ensureNullOr = function (argument, whenNotNull, optionalDescription) {
    ensureFunction(whenNotNull, 'predicate for the not null case');
    if (argument === null) {
        return;
    } else {
        whenNotNull(argument, 'Not null case (' + optionalDescription + ')');
    }
};

decorateWithDescription(ensureNull);
ensureNull.or = function(whenNotNull) {
    ensureFunction(whenNotNull);
    return function(argument, optionalDescription) {
        ensureNullOr(argument, whenNotNull, optionalDescription);
    };
};


var ensureJqueryObject =  function (object) {
    // see http://api.jquery.com/jquery-2/
    if (!object || !object.jquery) {
        console.error('Object expected to be jQuery object', object);
        throw new Error('Not a jQuery object: ' + object);
    }
    if (object.length !== 1) {
        throw new Error('Not a single jQuery object' + object);
    }
};

// see https://stackoverflow.com/questions/3086068/how-do-i-check-whether-a-jquery-element-is-in-the-dom
// and https://jsperf.com/jquery-element-in-dom/2
var isInDom = function(element) {
    ensureJqueryObject(element);
    return $.contains(document.documentElement, element[0]);
};

var ensureInDom = function(element, message) {

    if (!isInDom(element)) {
        // not in DOM anymore (cell scrolled out after post render invoked but before column based time shift elapsed)
        // see https://stackoverflow.com/questions/3086068/how-do-i-check-whether-a-jquery-element-is-in-the-dom
        // and https://jsperf.com/jquery-element-in-dom/2
        if (message) {
            throw new Error(message);
        } else {
            throw new Error('Element is not in DOM: ' + element);
        }
    }

};

var idFor = function(element, prefix) {
    ensureInDom(element);

    if (element.length !== 1) {
        throw new Error('A single element is expected, got ' + element.length);
    }
    ensureUndefinedOr(prefix, ensureString, 'Default ID prefix');

    var id = element.attr('id');
    if (!id) {
        var counter = 1;

        while (true) {
            id = (prefix ? prefix + '-' : 'auto-assigned-id-') + counter;
            if (!document.getElementById(id)) {
                break;
            }
            counter++;
        }
        element.attr('id', id);
    }
    return id;
};

/**
 * Internal function to generate next unique IDs.
 */
var nextid = (function() {
    var count = 0;

    /**
     * Create next ID to use.
     *
     * @param c Component name
     * @return unique HTML ID/ID prefix to use
     */
    return function(c) {
        ensureString(c, 'Component/role name');
        return "simsearch-" + c + "-" + (count++);
    };
})();


/**
 * Transpose two arrays into one array having two element objects.
 *
 * @param x X array
 * @param y Y array
 * @return an array of { x : X[i], y : y[i] } objects
 */
function transpose(x, y) {
    ensureArray(x, 'X array');
    ensureArray(y, 'Y array');
    var ret = [];
    for( var i = 0; i < x.length && i < y.length; i++) {
        ret.push({ x: x[i], y: y[i]});
    }
    return ret;
}


_.mixin({
    transpose : transpose,
    // Logging related ---------------------------------------------------------------------------------------------
    getLog: function(name) {
        return getLog(name, false);
    },
    getNewLog: function(name) {
        return getLog(name, true);
    },
    incLogDetail : function(namePrefix) {
        getLog.incLogDetail(namePrefix);
    },
    decLogDetail : function() {
        getLog.decLogDetail();
    },
    getLogParam : getLog.getLogParam,
    // DOM tools ---------------------------------------------------------------------------------------------------
    nextid : nextid,
    idFor : idFor,
    idSelectorFor : function(element, prefix) {
        return '#' + idFor(element, prefix);
    },
    isInDom : isInDom,
    // Formatting --------------------------------------------------------------------------------------------------
    formatMemorySi : formatting.formatMemorySi,
    formatMemory : formatting.formatMemory,
    formatSi : formatting.formatSi,
    formatSiFloor : formatting.formatSiFloor,
    formatTime : formatting.formatTime,
    formatTimeLong : formatting.formatTimeLong,
    formatMostSimilar0 : formatting.formatMostSimilar0,
    formatMostSimilar1 : formatting.formatMostSimilar1,
    replaceTabNl : formatting.replaceTabNl,
    // Time conversions --------------------------------------------------------------------------------------------
    toOnePerSec : function (timeInMs) { return 1000 / timeInMs; },
    toOnePerMin : function (timeInMs) { return 60 * 1000 / timeInMs; },

    // Preconditions -----------------------------------------------------------------------------------------------
    checkFields : function(expected, actual) {
        ensureNotUndefined(expected, 'Expected object pattern');
        ensureNotUndefined(actual, 'Object to check');

        Object.getOwnPropertyNames(actual).forEach(function(propname) {
            if (!expected[propname]) {
                throw new Error('Extra propname in object to check: "' + propname + '" (value: ' + actual[propname] + ')');
            }
        });

        Object.getOwnPropertyNames(expected).forEach(function(propname) {
            ensureFunction(expected[propname], 'Checker for propname "' + propname + '"');
            expected[propname](actual[propname], 'property "' + propname + '"');
        });

    },
    ensureAny : function() { /* for checking optional fields */ },
    ensureArray: ensureArray,
    ensureArrayLike: ensureArrayLike,
    ensureBoolean : ensureBoolean,
    ensureUndefinedOr : ensureUndefinedOr,
    ensureJqueryObject: ensureJqueryObject,
    ensureInDom : ensureInDom,
    ensureUndefined: ensureUndefined,
    ensureNotUndefined: ensureNotUndefined,
    ensureNull : ensureNull,
    ensureNullOr : ensureNullOr,
    ensureString: ensureString,
    ensureInteger: ensureInteger,
    ensurePositiveInteger: ensurePositiveInteger,
    ensureNonNegativeInteger : ensureNonNegativeInteger,
    ensurePositiveFinite: ensurePositiveFinite,
    ensureNotFound: function (selector, optionalDescription) {
        ensureString(selector);
        ensureUndefinedOr(optionalDescription, ensureString);
        var res = $(selector);
        if (res.length !== 0) {
            var message = 'Unexpected ' + res.length + ' match(es) for "' + selector + '"';
            if (optionalDescription) {
                message = message + ' (' + optionalDescription + ')';
            }
            throw new Error(message);
        }
    },
    ensureFunction: ensureFunction,
    ensureFinite: function (argument, optionalDescription) {
        ensureNotUndefined(argument, optionalDescription);
        if (!_.isFinite(argument)) {
            var message;
            if (optionalDescription) {
                message = 'Argument "' + optionalDescription + '" is not a finite number: ' + argument;
            } else {
                message = 'Not a finite number: ' + argument;
            }
            throw new Error(message);
        }
    },
    curryOneArg: function (func, arg) {
        _.ensureFunction(func);
        if (func.length !== 1) {
            throw new Error('One arg expected, got ' + func.length);
        }
        return function () {
            if (arguments.length !== 0) {
                throw new Error('No arg expected, got ' + arguments.length);
            }
            func(arg);
        };
    }
});


export default _;
