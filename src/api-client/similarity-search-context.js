"use strict";

import * as dataaccess from '../api-client/dataaccess.js';
import createAsyncClient from '../api-client/async-client.js';
import createDissimilarityDomain from '../api-client/dissimilarity-domain.js';
import _ from '../common/lodash-mod.js';
import d3 from '../deps/d3.js';

/**
 * Encapsulates a descriptor based similarity search.
 *
 * Provides higher level data access layer:
 *  - encapsulates descriptor and metric reference
 *  - encapsulates dissimilarity domain
 */

/**
 * Create search context.
 *
 * @param opts Options to be used
 * @param desc
 * @param optionalMetric optional metric to be used
 * @return context facade
 */
export default function createSearchContext(opts) {
    var log= _ .getNewLog('similarity-search-context').log('Opts:', opts);

    _.checkFields({
        async : _.ensureUndefined.or(_.ensureBoolean),
        desc : _.ensureString.description('Descriptor (fingerprint) REST reference'),
        metric : _.ensureUndefined.or(_.ensureString), // .description('result handler for async request completion'),
        success : _.ensureFunction.description('Result handler for similarity searches / distribution calculation'),
        progress : _.ensureFunction.description('Result handler for progress reports'),
        error : _.ensureFunction
    }, opts);



    var descref;
    var metric;

    // Dissimilarity domain
    // Updated on every data bind; reset on metric/descriptor change
    var dissimilarityDomain = createDissimilarityDomain();


    // Async client is responsible for launching async requests

    var mssAsyncClient;
    var distAsyncClient;
    function initMssAsyncClient(descRef) {
        if (mssAsyncClient) {
            mssAsyncClient.cancel();
        }
        mssAsyncClient = createAsyncClient({
            target : descRef + '/find-most-similars-async?sync-result-timeout-ms=150',
            success : function(resp) {
                dissimilarityDomain.update_from_mss_hits(resp);
                opts.success(resp);
            },
            progress : opts.progress,
            error : opts.error
        });
    }
    function initDistAsyncClient(descRef) {
        if (distAsyncClient) {
            distAsyncClient.cancel();
        }
        distAsyncClient = createAsyncClient({
            target : descRef + '/distribution-async?sync-result-timeout-ms=150',
            success : function(resp) {
                opts.success(resp);
            },
            progress : opts.progress,
            error : opts.error
        });
    }
    initMssAsyncClient(opts.desc);
    initDistAsyncClient(opts.desc);




    var facade = {
        // @return true when invocation changed state; false when already used descriptor/metric was specified
        setDescriptor : function(desc, optionalMetric) {

            if (!desc) {
                throw new Error('No descriptor specified');
            }
            if (desc === descref && metric === optionalMetric) {
                // no change
                return false;
            }
            initMssAsyncClient(desc)
            initDistAsyncClient(desc)
            descref = desc;
            metric = optionalMetric ? optionalMetric : '';
            dissimilarityDomain.init();

            return true;
        },
        // @return true when invocation changed state; false when already used metric was specified
        setMetric : function(m) {
            if (metric === m) {
                return false;
            }


            metric = m;
            dissimilarityDomain.init();
            return true;
        },
        getMetric : function() {
            return metric;
        },
        getDescref : function() {
            return descref;
        },
        getDescInfo : function(onSuccess) {
            dataaccess.getDescInfo(descref, onSuccess);
            return facade;
        },
        getDissimilarityDomain : dissimilarityDomain.getDomainAsString,
        dissimToPercentString : dissimilarityDomain.dissimToPercentString,
        // launch search; requestParams will be decorated with metric parameter
        findMostSimilars : function(requestParams) {
            _.checkFields({
                query : _.ensureString.description('Query molecule source'),
                maxCount : _.ensureNonNegativeInteger.description('Max hit count'),
            }, requestParams);

            mssAsyncClient.cancel();

            if (opts.async === true) {
                // Launch async request
                requestParams.metric = metric;
                mssAsyncClient.request(requestParams);
            } else {
                // Launch synchronous request
                // Invoke service
                dataaccess.findMostSimilars({
                    descref : descref,
                    metric : metric,
                    query : requestParams.query,
                    maxcount : requestParams.maxCount,

                    success: function(resp) {
                        dissimilarityDomain.update_from_mss_hits(resp);
                        opts.success(resp);
                    },
                    error : opts.error
                });
            }
        },
        calculateDissimilarityDistribution : function(requestParams) {
            _.checkFields({
                query : _.ensureString.description('Query molecule source'),
                bincount : _.ensureNonNegativeInteger.description('Bin count'),
            }, requestParams);
            distAsyncClient.cancel();

            if (opts.async === true) {
                // launch async request
                var p = {
                    query : requestParams.query,
                    bins : requestParams.bincount,
                    metric : metric
                };
                distAsyncClient.request(p);
            } else {
                dataaccess.dissimilarityDistribution({
                    descref : descref,
                    metric: metric,
                    query : requestParams.query,
                    bincount : requestParams.bincount,
                    success: opts.success,
                    error : opts.error
                });
            }
        }
    };


    facade.setDescriptor(opts.desc, opts.metric);

    return facade;


}
