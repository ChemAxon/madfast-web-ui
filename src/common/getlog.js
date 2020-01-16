"use strict";

import '../../node_modules/lodash/lodash.min.js';
import getPageParameter from './pageparam.js';


var logParam = getPageParameter('log');

// Map of logger name to logger
var loggers = {};

var logFactory ;


if (logParam === 'all') {
    // we will log
    console.log(
            '%cLogging is on',
            'background: green; color: white; display: block; padding: 5px; border-radius: 2px; margin-bottom: 5px;');
    console.groupCollapsed('Logging details');
    console.log('Requested by URL parameter "log" with value: ' + logParam);
    console.log('All logger output displayed.');
    console.groupEnd();

    logFactory = function(name) {
        var logger = function() {
            var nl = [];
            nl.push('%c' + name);
            nl.push('background: #808080; color: yellow; padding: 2px; border-radius: 2px;');
            for (var i = 0; i < arguments.length; i++) {
                nl.push(arguments[i]);
            }
            console.log.apply(this, nl);
            return logger; // the first log message can be displayed when log factory is accessed
        };

        logger.log=logger;
        logger.error = function() {
            var nl = [];
            nl.push('%c' + name);
            nl.push('background: #802020; color: #fbb4ae; padding: 2px; border-radius: 2px;');
            for (var i = 0; i < arguments.length; i++) {
                nl.push(arguments[i]);
            }
            console.log.apply(this, nl);
            return logger; // the first log message can be displayed when log factory is accessed
        };
        logger.enabled = true;
        return logger;
    };
} else {
    // no logging
    // return valid log factory
    logFactory = function() {
        var logger = function() {
            return logger;
        };
        logger.log=logger;
        logger.error=logger;
        logger.enabled = false;
        return logger;
    };
}

/**
 * Name prefixes to use for subsequent logger creation/retrieval.
 */
var namePrefixes = [];

/**
 * GetLog function.
 *
 * @param baseName Name of the logger
 * @param newLog When {@code true} always construct a new logger with an unique name
 * @returns {getlogL#6.loggers|loggers}
 */
export default function getLog(baseName, newLog) {
    if (!baseName) {
        throw new Error('No logger name specified');
    }
    if (!_.isString(baseName)) {
        throw new Error('Logger name is not a String: ' + baseName);
    }

    var namePrefix = '';
    for (var i = 0; i < namePrefixes.length; i++) {
        namePrefix = namePrefix + namePrefixes[i] + ' / ';
    }

    var name;
    if (newLog === false && !loggers[baseName]) {
        // no new (unique) logger needs to be created
        // note that always add numeric suffix to logger name when unique logger is requested
        name = namePrefix + baseName;
    } else {
        // an unique logger needs to be created, make sure the name is unique
        var i = 1;
        while (loggers[namePrefix + baseName + '-' + i]) {
            i++;
        }
        name = namePrefix + baseName + '-' + i;
    }

    if (!loggers[name]) {
        // Create new logger when needed
        loggers[name] = logFactory(name);
    }

    return loggers[name];
};

/**
 * Add a name prefix level.
 *
 * @param nameFragment Name fragment to use in the subsequent log creations
 */
getLog.incLogDetail = function(nameFragment) {
    _.ensureString(nameFragment, 'log prefix name fragment');
    namePrefixes.push(nameFragment);
};


getLog.decLogDetail = function() {
    if (namePrefixes.length === 0) {
        throw new Error('No open level');
    }
    namePrefixes.pop();
};

getLog.getLogParam = function() {
    return logParam;
};

