"use strict";

/**
 * Network layer for MadFast UIs.
 *
 * Network layer is responsible to send/reveive requests over the network to MadFast server. This module provides a
 * jQuery AJAX-like API.
 */

import '../common/lodash-mod.js';
import * as topmsg from '../ui/ui-topmsg.js';

var log = _.getLog('network');

/**
 * Error handler factory for $.ajax requests.
 *
 * Default behavior shows an error message on the top of the window. When a callback is specified in case of error
 * the callback is invoked with the error descriptor object as the argument.
 *
 * To display errors on the top of the page:
 *     $.ajax({
 *         ...
 *         error : simsearch.ajaxerror(undefined, url)
 *     });
 *
 * To handle proper JSON error descriptor object to a callback, otherwise display on the top of the page:
 *     $.ajax({
 *         ...
 *         error : simsearch.ajaxerror(function(json) { .... }, url)
 *     });
 *
 * @param cb optional function(json) to invoke upon receiving proper JSON in xhr.responseJSON. Wont be invoked
 * when response is NOT a proper JSON error response
 *
 * @param url URL where the request was sent
 * @param ext Optional additional data paired to the request
 *
 * @returns Error handler to pass as $.ajax({ error : .... })
 */
var ajaxerror = function(cb, url, ext) {
    _.ensureUndefinedOr(cb, _.ensureFunction, 'handler of JSON error response');
    _.ensureUndefinedOr(url, _.ensureString, 'URL');

    return function(xhr, status, error) {
        log('Error handler invoked. xhr:', xhr);
        log('status:', status, 'error:', error);

        var errorJson;

        // Check if xhr contains our error response JSON
        if (xhr.responseJSON
                && xhr.responseJSON.statusCode
                && xhr.responseJSON.statusReasonPhrase
                && xhr.responseJSON.statusClass
                /*&& xhr.responseJSON.message*/) {
            // we have proper error response
            errorJson = xhr.responseJSON;
            errorJson.url = url;
            errorJson.generated = false;
            log.error('Error response JSON (from ' + url + ')', errorJson);
        } else {
            // Not our response JSON; generate one
            errorJson = {
                url : url,
                generated : true,
                statusCode : xhr.status,
                statusReasonPhrase : xhr.statusText,
                message: xhr.statusText,
                statusClass : '??'
            };

            log.error('Generate error response JSON', errorJson);
        }

        if (cb) {
            // invoke callback
            cb(errorJson, ext);
        } else {
            topmsg.error('Error (' + errorJson.statusCode + ') accessing server: ' + errorJson.message);
            if (errorJson.exceptionStackTrace) {
                console.log('Stack trace:');
                console.log(errorJson.exceptionStackTrace);
            }
        }
    };
};

/**
 * Display top error message and call an optional callback.
 *
 * @param cb Optional function() callback to invoke upon failure
 * @returns Error handler to pass as $.ajax({ error : .... })
 */
var topErrAnd = function(cb) {
    _.ensureUndefinedOr(cb, _.ensureFunction, 'Callback to invoke upon failure');

    return function(xhr, status, error) {
        // Check if xhr contains our error response JSON
        if (xhr.responseJSON
                && xhr.responseJSON.statusCode
                && xhr.responseJSON.statusReasonPhrase
                && xhr.responseJSON.statusClass
                && xhr.responseJSON.message) {
            // we have proper error response
            topmsg.error("Error accessing server: " + xhr.responseJSON.message);
        } else {
            // Not our response JSON; display error on the top of the screen
            topmsg.error("Error accessing server: " + status + " (" + error + ")");
        }
        cb();
    };
};

export function post(opts) {
    _.checkFields({
        url : _.ensureString.description('Request URL'),
        success : _.ensureFunction.description('Function to invoke with the response'),
        data : _.ensureNotUndefined,
        error : _.ensureUndefined.or(_.ensureFunction)
    }, opts);

    $.ajax({
        url : opts.url,
        contentType: "application/x-www-form-urlencoded;charset=utf-8",
        type : 'POST',
        data : opts.data,
        dataType: 'json',
        success : opts.success,
        error : ajaxerror(opts.error, opts.url)
    });

};


export function postJson(opts) {
    _.checkFields({
        url : _.ensureString.description('Request URL'),
        success : _.ensureFunction.description('Function to invoke with the response'),
        data : _.ensureNotUndefined,
        error : _.ensureUndefined.or(_.ensureFunction),
        ext : _.ensureUndefined.or(_.ensureNotUndefined)
    }, opts);
    // See https://stackoverflow.com/questions/6323338/jquery-ajax-posting-json-to-webservice
    $.ajax({
        url : opts.url,
        contentType: "application/json; charset=utf-8",
        type : 'POST',
        data : JSON.stringify(opts.data),
        dataType: 'json',
        success : function(json) { opts.success(json, opts.ext); },
        error : ajaxerror(opts.error, opts.url, opts.ext)

    });

}


export function get(opts) {
    _.checkFields({
        url : _.ensureString.description('Request URL'),
        success : _.ensureFunction.description('Function to invoke with the response'),
        error : _.ensureUndefined.or(_.ensureFunction),
        ext : _.ensureUndefined.or(_.ensureNotUndefined),
        data : _.ensureUndefined.or(_.ensureNotUndefined)
    }, opts);

    var ajaxopts = {
        url : opts.url,
        type : 'GET',
        success : function(json) {
            opts.success(json, opts.ext);
        },
        error : ajaxerror(opts.error, opts.url, opts.ext)
    };

    if (opts.data) {
        ajaxopts.data = opts.data;
    }

    $.ajax(ajaxopts);
};

/**
 * Launch multiple requests.
 *
 * Invoke success handler when all resplved; invoke error handler on the first error.
 *
 */
export function multipleRequests(opts) {
    _.checkFields({
        reqs : _.ensureNotUndefined,
        success : _.ensureFunction.description('Function to invoke with the response'),
        error : _.ensureUndefined.or(_.ensureFunction),
        ext : _.ensureUndefined.or(_.ensureNotUndefined)
    }, opts);

    var reqNames = Object.keys(opts.reqs);


    for (var i = 0; i < reqNames.length; i++) {
        var name = reqNames[i];
        var req = opts.reqs[name];
        _.checkFields({
            f : _.ensureFunction.description('Function to invoke the request'),
            opts : _.ensureNotUndefined.description('Parameter object to pass to the function'),
        }, req);
        _.ensureUndefined(req.success, 'Success handler should not be specified here');
        _.ensureUndefined(req.error, 'Error handler should not be specified here');
    }

    var response = {};
    var error = false;
    var waiting = reqNames.length;

    var errorHandler = function(err) {
        if (error) {
            return;
        }
        error = true;
        if (opts.error) {
            opts.error(err);
        }
    };

    var createSuccessHandler = function(name) {
        return function(res) {
            if (error) {
                return;
            }
            response[name] = res;
            waiting--;
            if (waiting === 0) {
                opts.success(response, opts.ext);
            }
        };
    };


    for (var i = 0; i < reqNames.length; i++) {
        var name = reqNames[i];
        var req = opts.reqs[name];
        req.opts.success = createSuccessHandler(name);
        req.opts.error = errorHandler;
        req.f(req.opts);
    }
}

