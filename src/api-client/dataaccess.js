"use strict";

/**
 * Data access layer for MadFast UIs.
 */

import _ from '../common/lodash-mod.js';
import * as network from './network.js';
//import downloadjs from 'download';
import downloadjs from '../deps/download.js';
import * as uicommon from '../ui/ui-common.js';

var log = _.getLog('data-access');

/**
 * URL prefix to use when accessing the server.
 */
var urlprefix = "";


/**
 * Decorate page link with log and base parameters.
 *
 * @param page Page link
 * @param ref Optional ref parameter
 * @returns decorated page link
 */
export function decoratePageLink(page, ref) {
    var ret = page;

    var b = false;
    function addSep() {
        if (b) {
            ret += '&';
        } else {
            ret += '?';
        }
        b = true;
    }

    var base = urlprefix ? 'base=' + encodeURIComponent(urlprefix) : '';
    if (base) {
        addSep();
        ret += base;
    }
    var log = _.getLogParam() ? 'log=' + encodeURIComponent(_.getLogParam()) : '';
    if (log) {
        addSep();
        ret += log;
    }
    var refp = ref ? 'ref=' + encodeURIComponent(ref) : '';
    if (refp) {
        addSep();
        ret += refp;
    }

    if (uicommon.isPresenting()) {
        addSep();
        ret += 'present=true';
    }
    return ret;
}

export function profresPageLink(name) {
    var url = 'rest/profres/' + name;
    if (urlprefix) {
        url = urlprefix + url;
    }
    var ret = 'showProf.html?ref=' + encodeURIComponent(url);
    if (urlprefix) {
        ret += '&base=' + encodeURIComponent(urlprefix);
    }
    if (_.getLogParam()) {
        ret += '&log=' + encodeURIComponent(_.getLogParam());
    }
    if (uicommon.isPresenting) {
        ret += '&present=true';
    }

    return ret;
}


/**
 * Return index page link.
 *
 * Considers url prefix and logging settings.
 *
 * @returns index page link for navigating back to the main page.
 */
export function getIndexPageLink() {
    // Relative path used to allow putting the MadFast server behind a reverse proxy with a custom path
    return decoratePageLink('index.html');
}

/**
 * Return demo page link.
 *
 * Considers url prefix and logging settings.
 *
 * @returns index page link for navigating back to the main demo page.
 */
export function getUiDemoPageLink() {
    // Relative path used to allow putting the MadFast server behind a reverse proxy with a custom path
    return decoratePageLink('demo.html');
}

/**
 * Set URL prefix for further MadFast REST API requests
 *
 * @param u URL prefix to set. Requests will be sent to <URLPREFIX> + "rest/....."
 */
export function setUrlPrefix(u) {
    _.ensureString(u, 'URL prefix to use');
    log('Use URL prefix for further REST requests:', u);
    urlprefix = u;
};

/**
 * Get current URL prefix.
 *
 * @returns URL prefix currently set
 */
export function getUrlPrefix() {
    return urlprefix;
}





/**
 * Launch health check.
 *
 * @param success Function invoked with no argument when health check endpoint responded
 * @param error Function invoked with error JSON when health check endpoint failed or no response
 */
export function healthCheck(success, error) {
    _.ensureFunction(success, 'Success callback');
    _.ensureFunction(error, 'Error callback');
    network.get({
        url : urlprefix + 'rest/statistics',
        success : function() { success(); },
        error : error
    });
}

/**
 * Launch health check.
 *
 * @param success Function invoked with statistics
 */
export function getStatistics(success) {
    _.ensureFunction(success, 'Success callback');
    network.get({
        url : urlprefix + 'rest/statistics',
        success : success
    });
}



export function EXPERIMENTALgetAllMemoryUsage(success) {
    _.ensureFunction(success, 'Success callback');
    network.get({
        url : urlprefix + 'rest/statistics/get-total-sizeinfo?method=CALCULATED',
        success : success
    });
}

export function EXPERIMENTALgetProfilingSnapshot(success) {
    _.ensureFunction(success, 'Success callback');
    network.get({
        url : urlprefix + 'rest/statistics/profiling-snapshot',
        success : success
    });
}

export function EXPERIMENTALgetTasks(success) {
    _.ensureFunction(success, 'Success callback');
    network.get({
        url : urlprefix + 'rest/experimental-tasks',
        success : success
    });
}

export function EXPERIMENTALgetLoadingStatus(success) {
    _.ensureFunction(success, 'Success callback');
    network.get({
        url : urlprefix + 'rest/statistics/loading-status',
        success : success
    });
}


/**
 * Meta servlet.
 *
 * @param success Handler for resource description
 * @param error Optional error handler
 * @returns {undefined}
 */
export function meta(success, error) {
    _.ensureFunction(success, 'Success callback');
    network.get({
        url : urlprefix + 'rest/meta',
        success : success,
        error : error
    });
}

/**
 * Invoke multiple molecule conversions.
 *
 * See API endpoint https://disco.chemaxon.com/products/madfast/latest/doc/enunciate/resource_MolConverter.html#resource_MolConverter_converMultiplePost_POST
 */
export function convertMultipleMols(opts) {
   _.checkFields({
        requests : _.ensureArray.description('Conversion requests'),
        success : _.ensureFunction.description('result handler'),
        error : _.ensureUndefined.or(_.ensureFunction),
    }, opts);

    for(var i = 0; i < opts.requests.length; i++) {
        _.checkFields({
             src : _.ensureString.description('structure source'),
             f : _.ensureString.description('target format'),
             importopts : _.ensureUndefined.or(_.ensureString),
             molname : _.ensureUndefined.or(_.ensureString),
             binary : _.ensureUndefined.or(_.ensureNotUndefined),
             molprops : _.ensureUndefined.or(_.ensureNotUndefined),
             pseudos : _.ensureUndefined.or(_.ensureNotUndefined)
        }, opts.requests[i]);
        opts.requests[i].mol = opts.requests[i].src; // REST API endpoint uses mol
        opts.requests[i].src = undefined;
    }

    // we can directly post opts.requests
    var postData = {
        requests : opts.requests
    };

    network.postJson({
        url : urlprefix + 'rest/molconverter/convert-multiple',
        data : postData,
        success : opts.success,
        error : opts.error
    });
}


/**
 * Invoke a molecule conversion.
 *
 * See API endpoint https://disco.chemaxon.com/products/madfast/latest/doc/enunciate/resource_MolConverter.html#resource_MolConverter_convertPost_POST
 */
export function convertMol(opts) {
   _.checkFields({
        src : _.ensureString.description('structure source'),
        f : _.ensureString.description('target format'),
        importopts : _.ensureUndefined.or(_.ensureString),
        molname : _.ensureUndefined.or(_.ensureString),
        success : _.ensureFunction.description('result handler'),
        error : _.ensureUndefined.or(_.ensureFunction),
        binary : _.ensureUndefined.or(_.ensureNotUndefined),
        molprops : _.ensureUndefined.or(_.ensureNotUndefined),
        pseudos : _.ensureUndefined.or(_.ensureNotUndefined)
    }, opts);

    var postData = {
        mol : opts.src,
        f : opts.f,
        molname : opts.molname,
        importopts : opts.importopts,
        binary : opts.binary,
        molprops : opts.molprops,
        pseudos : opts.pseudos
    };

    network.postJson({
        url : urlprefix + 'rest/molconverter/convert',
        data : postData,
        success : opts.success,
        error : opts.error
    });

};

/**
 * Find most similar structures.
 *
 * Typical usage is real time search.
 */
export function findMostSimilars(opts) {
   _.checkFields({
        success : _.ensureFunction.description('result handler'),
        error : _.ensureUndefined.or(_.ensureFunction),

        descref : _.ensureString.description('Target descriptors resource reference'),
        query : _.ensureString.description('Query structure source'),
        maxcount : _.ensurePositiveInteger.description('Max hit count'), // prepare for other hit limiting options like max-dissim
        w : _.ensureUndefined.or(_.ensurePositiveFinite),
        h : _.ensureUndefined.or(_.ensurePositiveFinite),
        metric : _.ensureUndefined.or(_.ensureString)
    }, opts);

    var postData = {
        query : opts.query,
        'max-count' : opts.maxcount,
        w : opts.w,
        h : opts.h,
        metric : opts.metric
    };
    network.post({
        url : urlprefix + opts.descref + '/find-most-similars',
        data : postData,
        success : opts.success,
        error : opts.error
    });
}


/**
 * Calculate dissimilarity distribution for a query structure.
 */
export function dissimilarityDistribution(opts) {
   _.checkFields({
        success : _.ensureFunction.description('result handler'),
        error : _.ensureUndefined.or(_.ensureFunction),
        descref : _.ensureString.description('Target descriptors resource reference'),
        query : _.ensureString.description('Query structure source'),
        bincount : _.ensurePositiveInteger.description('Histogram bin count'),
        metric : _.ensureUndefined.or(_.ensureString)
        // TODO: handle upper/lower bounds
    }, opts);

    var postData = {
        query : opts.query,
        bins : opts.bincount,
        metric : opts.metric
    };
    network.post({
        url : urlprefix + opts.descref + '/distribution',
        data : postData,
        success : opts.success,
        error : opts.error
    });
};



/**
 * Import structure and convert to 2D MRV.
 */
export function convertTo2dMrv(opts) {
   _.checkFields({
        src : _.ensureString.description('structure source'),
        importopts : _.ensureUndefined.or(_.ensureString),
        success : _.ensureFunction.description('result handler'),
        error : _.ensureUndefined.or(_.ensureFunction)
    }, opts);

    var postData = {
        mol : opts.src,
        f : 'mrv',
        clean2d : true,
        importopts : opts.importopts
    };

    network.post({
        url : urlprefix + 'rest/molconverter/convert',
        data : postData,
        success : opts.success,
        error : opts.error
    });
};

/**
 * Import strcuture and convert to 2D Base64 encoded PNG.
 *
 * Note that result handler will be invoked with the Base64 content.
 */
export function convertTo2dPng(opts) {
   _.checkFields({
        src : _.ensureString.description('structure source'),
        importopts : _.ensureUndefined.or(_.ensureString),
        success : _.ensureFunction.description('result handler'),
        error : _.ensureUndefined.or(_.ensureFunction),
        w : _.ensurePositiveFinite.description('image width in pixels'),
        h : _.ensurePositiveFinite.description('image height in pixels')
    }, opts);

    var postData = {
        mol : opts.src,
        f : 'png:w' + Math.round(opts.w) + ',h' + Math.round(opts.h),
        binary : true,
        importopts : opts.importopts
    };

    network.post({
        url : urlprefix + 'rest/molconverter/convert',
        data : postData,
        success : function (res) { opts.success(res.result); },
        error : opts.error
    });

}


/**
 * Compose URL for molecule image.
 */
export function molImgUrl(opts) {
   _.checkFields({
        mol : _.ensureAny,
        mols : _.ensureAny,
        index : _.ensureAny,
        w : _.ensurePositiveFinite.description('image width'),
        h : _.ensurePositiveFinite.description('image height'),
        aromatize : _.ensureUndefined.or(_.ensureString),
        hydrogenize : _.ensureUndefined.or(_.ensureString)
    }, opts);


    var molref;
    if (opts.mol) {
        // single molecule reference given
        _.ensureString(opts.mol, 'single molecule reference');
        _.ensureUndefined(opts.mols);
        _.ensureUndefined(opts.index);
        molref = opts.mol;
    } else {
        // molecules resource reference and index given
        _.ensureString(opts.mols, 'molecules resource reference');
        _.ensureInteger(opts.index, 'molecule index');
        molref = opts.mols + '/' + opts.index;
    }

    var ret = urlprefix + molref + '/png-or-placeholder?w=' + Math.round(opts.w) + '&h=' + Math.round(opts.h);
    if (opts.aromatize) {
        ret = ret + "&aromatize=" + encodeURIComponent(opts.aromatize);
    }
    if (opts.hydrogenize) {
        ret = ret + "&hydrogenize=" + encodeURIComponent(opts.hydrogenize);
    }
    return ret;
};

/**
 * Compose URL for molecule image of a k-NN query.
 */
export function knnQueryMolImgUrl(opts) {
   _.checkFields({
        knnref : _.ensureString.description('Knn results ref'),
        queryIndex : _.ensureNonNegativeInteger.description('Query index'),
        w : _.ensurePositiveFinite.description('image width'),
        h : _.ensurePositiveFinite.description('image height'),
        aromatize : _.ensureUndefined.or(_.ensureString),
        hydrogenize : _.ensureUndefined.or(_.ensureString)
    }, opts);

    var ret = urlprefix + opts.knnref + '/query-png-or-placeholder?query=' + Math.round(opts.queryIndex) + '&w=' + Math.round(opts.w) + '&h=' + Math.round(opts.h);
    if (opts.aromatize) {
        ret = ret + "&aromatize=" + encodeURIComponent(opts.aromatize);
    }
    if (opts.hydrogenize) {
        ret = ret + "&hydrogenize=" + encodeURIComponent(opts.hydrogenize);
    }
    return ret;
};


/**
 * Compose URL for molecule image of a k-NN neighbor.
 */
export function knnNeighborMolImgUrl(opts) {
   _.checkFields({
        knnref : _.ensureString.description('Knn results ref'),
        queryIndex : _.ensureNonNegativeInteger.description('Query index'),
        neighborIndex : _.ensureNonNegativeInteger.description('Query index'),
        w : _.ensurePositiveFinite.description('image width'),
        h : _.ensurePositiveFinite.description('image height'),
        aromatize : _.ensureUndefined.or(_.ensureString),
        hydrogenize : _.ensureUndefined.or(_.ensureString)
    }, opts);

    var ret = urlprefix + opts.knnref + '/neighbor-png-or-placeholder?query=' + Math.round(opts.queryIndex) + '&neighbor=' + Math.round(opts.neighborIndex) + '&w=' + Math.round(opts.w) + '&h=' + Math.round(opts.h);
    if (opts.aromatize) {
        ret = ret + "&aromatize=" + encodeURIComponent(opts.aromatize);
    }
    if (opts.hydrogenize) {
        ret = ret + "&hydrogenize=" + encodeURIComponent(opts.hydrogenize);
    }
    return ret;
};




/**
 * Retrieve molecule IDs
 *
 * @param molsref Molecule set
 * @param indices Molecule indices
 * @param success Handler to process response
 */
export function getMolIds(molsref, indices, success) {
    _.ensureString(molsref, 'Molecules ref');
    _.ensureNotUndefined(indices);
    _.ensureFunction(success);
    network.post({
        url : urlprefix + molsref + '/get-multiple-ids',
        data : {
            indices: indices
        },
        success : success
    });
};

/**
 * Retrieve additional properties for molecule IDs.
 *
 * @param molsref Molecule set
 * @param indices Molecule indices
 * @param success Handler to process response
 */
export function getMolAdditionalProps(molsref, indices, success) {
    _.ensureString(molsref, 'Molecules ref');
    _.ensureNotUndefined(indices);
    _.ensureFunction(success);
    network.post({
        url : urlprefix + molsref + '/get-multiple-props',
        data : {
            indices: indices
        },
        success : success
    });

}

export function getMolId(molsref, index, success) {
    _.ensureString(molsref, 'Molecules ref');
    _.ensureNotUndefined(index);
    _.ensureFunction(success);
    network.get({
        url : urlprefix + molsref + '/' + index + '/id',
        success : success
    });
};


export function getMolInfo(molsref, index, success, smiles, props) {
    _.ensureString(molsref, 'Molecules ref');
    _.ensureNotUndefined(index);
    _.ensureFunction(success);
    network.get({
        url : urlprefix + molsref + '/' + index,
        success : success,
        data : {
            smiles : !!smiles,
            props : !!props
        }
    });

};


export function getMolProperties(opts) {
    _.checkFields({
        molsref : _.ensureString.description('Molecules ref'),
        propname : _.ensureString.description('Property name'),
        success : _.ensureFunction.description('Results handler'),
        error : _.ensureUndefined.or(_.ensureFunction)
    }, opts);

    network.get({
        url : urlprefix + opts.molsref + '/props/' + opts.propname + '/get-properties-on-index-range',
        success : opts.success,
        error : opts.error
    });
}

export function getAvailableDescriptors(success) {
    _.ensureFunction(success, 'Handler for available descriptors');
    network.get({
        url : urlprefix + 'rest/descriptors',
        success : function(response) { success(response.descriptors); }
    });
}

export function getMetricsForDescriptor(descref, success) {
    _.ensureString(descref, 'Descriptor ref');
    _.ensureFunction(success, 'Handler for available metrics');
    network.get({
        url : urlprefix + descref + '/get-available-metrics',
        success : success
    });

}


export function getDescInfo(descref, success) {
    _.ensureString(descref, 'Descriptor ref');
    _.ensureFunction(success, 'Handler for structure source');
    network.get({
        url : urlprefix + descref,
        success : success
    });
}


export function getMolMrv(molref, success) {
    _.ensureString(molref, 'Molecule ref');
    _.ensureFunction(success, 'Handler for structure source');
    network.get({
        url : urlprefix + molref + '/cxformat',
        data : {
            f : 'mrv',
            clean2d : true
        },
        success : success
    });
}


/**
 * Retrieve k-NN table labels.
 *
 * @param knnref k-NN results resource reference
 * @param indices Query indices
 * @param success Handler to process response
 */
export function getKnnTableLabels(opts) {
   _.checkFields({
        knnref : _.ensureString.description('Knn results ref'),
        neighbors : _.ensureArray.description('Neighbor numbers'),
        queryindices : _.ensureArray.description('Query indices'),
        success : _.ensureFunction.description('Results handler'),
        error : _.ensureUndefined.or(_.ensureFunction)
    }, opts);

    network.post({
        url : urlprefix + opts.knnref + '/table-labels',
        data : {
            queries  : opts.queryindices,
            neighbors : opts.neighbors
        },
        success : opts.success,
        error : opts.error
    });
};



export function getKnnNeighborProps(opts) {
   _.checkFields({
        knnref : _.ensureString.description('Knn results ref'),
        neighborindex : _.ensureNonNegativeInteger.description('Neighbor index'),
        propname : _.ensureString.description('Property name'),
        success : _.ensureFunction.description('Results handler'),
        error : _.ensureUndefined.or(_.ensureFunction)
    }, opts);
    network.get({
        url : urlprefix + opts.knnref + '/neighbors/' + opts.neighborindex + '/props/' + opts.propname,
        success : opts.success,
        error :   opts.error
    });
}


export function getKnnQueryIndices(opts) {
   _.checkFields({
        knnref : _.ensureString.description('Knn results ref'),
        success : _.ensureFunction.description('Results handler'),
        error : _.ensureUndefined.or(_.ensureFunction)
    }, opts);
    network.get({
        url : urlprefix + opts.knnref + '/queryindices',
        success : opts.success,
        error :   opts.error
    });
}



export function getKnnNeighborCounts(opts) {
   _.checkFields({
        knnref : _.ensureString.description('Knn results ref'),
        success : _.ensureFunction.description('Results handler'),
        error : _.ensureUndefined.or(_.ensureFunction)
    }, opts);
    network.get({
        url : urlprefix + opts.knnref + '/neighborcounts',
        success : opts.success,
        error :   opts.error
    });
}


export function getKnnNeighborDissimilarities(opts) {
   _.checkFields({
        knnref : _.ensureString.description('Knn results ref'),
        neighborindex : _.ensureNonNegativeInteger.description('Neighbor index'),
        success : _.ensureFunction.description('Results handler'),
        error : _.ensureUndefined.or(_.ensureFunction)
    }, opts);
    network.get({
        url : urlprefix + opts.knnref + '/neighbors/' + opts.neighborindex + '/dissimilarities',
        success : opts.success,
        error :   opts.error
    });
}


export function getKnnNeighborIndices(opts) {
   _.checkFields({
        knnref : _.ensureString.description('Knn results ref'),
        neighborindex : _.ensureNonNegativeInteger.description('Neighbor index'),
        success : _.ensureFunction.description('Results handler'),
        error : _.ensureUndefined.or(_.ensureFunction)
    }, opts);
    network.get({
        url : urlprefix + opts.knnref + '/neighbors/' + opts.neighborindex + '/indices',
        success : opts.success,
        error :   opts.error
    });
}


export function download(data, contenttype, filename) {
    if (!data) {
        throw new Error("No data specified");
    }
    if (!contenttype) {
        throw new Error("No content type specified");
    }
    if (!filename) {
        throw new Error("No file name specified");
    }

    // delegate to download.js - see https://github.com/rndme/download
    downloadjs(data, filename, contenttype);
}

