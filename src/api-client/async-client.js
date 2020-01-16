"use strict";

/**
 * Asynchronous data access layer for MadFast UIs.
 *
 */

import _ from '../common/lodash-mod.js';
import * as network from './network.js';
import * as dataaccess from './dataaccess.js';


export default function createAsyncClient(opts) {
    var log = _ .getNewLog('async-client').log('New async client created. Opts:', opts);

    _.checkFields({
        // Async request target endpoint
        // Will be used to invoke the request
        target : _.ensureString.description('Asynchronous REST endpoint URL'),

        // Handler invoked on completion
        // First argument is the result object; second is the progress info
        success : _.ensureFunction, // .description('result handler for async request completion'),

        // Handler invoked on progress reporting
        // Argument is the progress info
        progress : _.ensureFunction.description('result handler for progress reports'),

        // Handler invoked on error
        // Argument is the error description
        error : _.ensureFunction,
    }, opts);

    // ID of the already running async call
    // will be used for polling and for cancelling
    var runningAsyncCallId;

    // Request sequence number helps to discard expired late responses
    // Before sending a request this number is incremented
    var lastReqSeq = 1;

    // set when there is a wait period for following progress
    var nextRequestTimeout;

    // Wait and issue poll request
    function poll() { nextRequestTimeout = setTimeout( function() {
        // After specified time passed this function is invoked
        // Launch a poll request
        if (!nextRequestTimeout) { return; }
        if (!runningAsyncCallId) { return; }
        nextRequestTimeout = undefined;

        lastReqSeq ++;


        network.get({
            url : dataaccess.getUrlPrefix() + 'rest/experimental-async-calls/' + runningAsyncCallId,
            ext : { seq : lastReqSeq },
            success : pollSuccess,
            error : pollError

        });


    }, 400 ); }


    /**
     * Success handler to digest async call dto.
     *
     * Invoked by the network request layer upon a successfull response. Note that the represented async task still might
     * be failed.
     *
     * @param asyncCallDto returned
     * @param ext Accessory data for the request; expected to be { seq : <NUMBER> }
     */
    function pollSuccess(json, ext) {
        log('pollSuccess, json:', json, 'ext:', ext);

        if (ext.seq !== lastReqSeq) {
            // There is a subsequent request; this response should be discarded
            return;
        }
        if (json.error) {
            // the represented task has failed
            // we can discard this task
            runningAsyncCallId = undefined;

            if (opts.error) {
                opts.error(json.error);
            }
        } else if (json.result) {
            // We have a synchronous result or the represented task succeed.
            // we can discard this taks
            runningAsyncCallId = undefined;

            opts.success(json.result);
        } else {
            // we have an async task launched
            // report its progress
            if (opts.progress) { opts.progress(json.task); }

            // administer task ID
            if (!runningAsyncCallId) {
                runningAsyncCallId = json.id;
            } else if (runningAsyncCallId !== json.id) {
                throw new Error(); // TODO
            }

            // wait to launch progress
            // TODO: invoke later
            poll();
        }

    }

    /**
     * Error hadler to digest async call dto.
     *
     * Invoked by the network request layer. This handler is called when the actual async api endpoint fails.
     *
     * @param json Error descriptor json
     * @param ext Accessory data for the request; expected to be { seq : <NUMBER> }
     */
    function pollError(json, ext) {
        log('pollError, json:', json, 'ext:', ext);
        // Failed to launch or poll the async task

        if (ext.seq !== lastReqSeq) {
            // There probably is a flying subseqent request; dont interfere with that
            // There is a subsequent request; this response should be discarded
            return;
        }

        // We discard the async task now
        // TODO: we could retry polling
        runningAsyncCallId = undefined;

        if (opts.error) {
            // Invoke error associated handler
            opts.error(json);
        }
    }


    var facade = {
        // Invoke async request with request object
        // In the case of a previous async call it will be cancelled
        request : function(ro) {
            log('request; ro:', ro);
            facade.cancel();

            lastReqSeq ++;

            // Launch async task
            network.postJson({
                url: dataaccess.getUrlPrefix() + opts.target,
                data : ro,
                ext : { seq : lastReqSeq },
                success : pollSuccess,
                error : pollError

            });

        },
        // Cancel an outgoing request (if there is any)
        // Typical usage is cleanup upon UI component removal
        cancel : function() {
            log('cancel(); runningAsyncCallId:', runningAsyncCallId, 'lastReqSeq:', lastReqSeq);
            lastReqSeq ++; // Invalidate possible running task
            if (nextRequestTimeout) {
                // kill poll
                clearTimeout(nextRequestTimeout);
                nextRequestTimeout = undefined;
            }
            if (!runningAsyncCallId) {
                // no running task, nothing to cancel
                return;
            }
            // cancel previous request
            network.postJson({
                url : dataaccess.getUrlPrefix() + 'rest/experimental-async-calls/' + runningAsyncCallId + '/cancel',
                data : {},
                success : function() { /* there is no expected response from the server */ }
            });

            runningAsyncCallId = undefined;
        }
    };

    return facade;

}
