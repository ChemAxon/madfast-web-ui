"use strict";


/**
 * Experimental limited JS client library for MadFast Web UI JS components.
 * 
 * For details see document "doc/using-webui-js-library.html" and the supplementary examples in 
 * "data/jsclient-additional/" directory of the MadFast distribution.
 *
 * This code is highly experimental, use with extreme caution - incompatible changes are expected.
 *
 * This file contains a reduced version of the JS client from the MadFast distribution: only references
 * to the contents of this open source repository are kept.
 *
 */

// 3rd party dependencies
import d3 from '../deps/d3.js';
import '../deps/bootstrap-deps.js';
import '../deps/font-awesome.js';
import '../deps/jquery-ui-deps.js';
import _ from '../common/lodash-mod.js';

// Common, shared functionalities
import * as pageparam from '../common/pageparam.js';
import * as formatting from '../common/formatting.js';

// API client layer
import * as dataaccess from '../api-client/dataaccess.js';
import * as network from '../api-client/network.js';
import * as createAsyncClient from '../api-client/async-client.js';
import createDescCtx from '../api-client/similarity-search-context.js';

// Various UI components
import * as uicommon from '../ui/ui-common.js';
import * as topmsg from '../ui/ui-topmsg.js';


var facade = {
    // lodash with some custom extensions, see https://lodash.com/
    _: _,

    // jQuery, see https://jquery.com/
    $: $,

    // D3.js v4, see https://d3js.org/
    d3: d3,

    // Web UI modules
    common: {
        formatting : formatting,
        pageparam: pageparam,
    },
    apiclient: {
        dataaccess: dataaccess,
        network: network,
        createAsyncClient: createAsyncClient,
        createDescCtx: createDescCtx
    },
    ui: {
        topmsg: topmsg,
        uicommon: uicommon
    }
};

// export for js client
window['EXPERIMENTAL-MADFAST-WEBUI-LIMITED'] = facade;

// export for testing
export default facade;
