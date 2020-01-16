"use strict";

import d3 from '../deps/d3.js';
import _ from '../common/lodash-mod.js';

export default function newDissimilarityDomain() {
    var log= _ .getNewLog('dissimilarity-domain').log('New dissimilarity domain created');

    var dissimilarityDomain;
    var dissimilarityToPercent;

    var ret = {
        // Set an initial dissimilarity domain to 0..1
        init : function() {
            dissimilarityDomain = [ 0, 1 ];
            dissimilarityToPercent = d3.scaleLinear()
                .domain(dissimilarityDomain)
                .range([0, 100]);
        },
        update_from_mss_hits(hits_response) {
            // Update dissimilarity domain based on hits response
            if (!dissimilarityDomain) {
                dissimilarityToPercent = undefined;
                dissimilarityDomain = [0, 1];
            }
            for (var di in hits_response.targets) {
                var d = hits_response.targets[di];
                var dissim = d.dissimilarity;
                if (dissim < dissimilarityDomain[0]) { dissimilarityDomain[0] = dissim; dissimilarityToPercent = undefined;}
                if (dissim > dissimilarityDomain[1]) { dissimilarityDomain[1] = dissim; dissimilarityToPercent = undefined;}
            }
            if (!dissimilarityToPercent) {
                // see https://github.com/d3/d3/issues/3113
                dissimilarityToPercent = d3.scaleLinear()
                        .domain(dissimilarityDomain)
                        .range([0, 100])
                        .nice();
            }

            log('Updated dissimilarity domain', dissimilarityDomain, dissimilarityToPercent);
        },
        dissimToPercentString : function(d) {
            var ret = dissimilarityToPercent(d);
            if (ret < 0) {
                ret = 0;
            } else if (ret > 100) {
                ret = 100;
            }
            return ret + '%';
        },
        getDomainAsString : function() {
            return dissimilarityDomain[0] + ' .. ' + dissimilarityDomain[1];
        }
    };
    ret.init();
    return ret;
}
