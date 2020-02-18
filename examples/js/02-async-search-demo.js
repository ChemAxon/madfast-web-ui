"use strict";

/**
 * Page logic for async search demo.
 *
 * We will use D3 to manipulate page, bind click handlers and interact with the JS client facade
 * Note that jQuery is still available and it is possible to use the two framework simultaneously when preferred.
 * 
 * In this example we wont use D3 data binding functionalities.
 */


// Get MadFast WebUI client library
var M = window['EXPERIMENTAL-MADFAST-WEBUI-LIMITED'];
console.log('MadFast WebUI limited client library facade:', M);

// Get 3rd party deps and WebUI components from the client facade
var d3 = M.d3;

// Extended lodash
var _ = M._;

var createDescCtx = M.apiclient.createDescCtx;
var dataaccess = M.apiclient.dataaccess;
var progress = M.landing.progress;

// D3 selection of page components
// set in initPage()
var logTableTbody;
var restApiUrlInput;
var targetDescriptorInput;
var queryStructureInput;
var dataDisplayModalTitle;
var dataDisplayModalContent;

var descSearchContext;

/**
 * Set UI state to started.
 * 
 * @param t Text to display
 */
function setUiToStarted(t) {
    d3.select('#results-div').selectAll('*').remove();
    d3.select('#results-div').append('h2').text(t);
}

/**
 * Display progress.
 * 
 * This example uses multiple approaches to extract and display progress information.
 * 
 * @param p Progress descriptor
 */

function setUiToProgress(p) {
    // Empty results area
    d3.select('#results-div').selectAll('*').remove();
    
    // Manually compose textual representation from progress descriptor
    d3.select('#results-div').append('h3').text('working');
    var t = 'Working; ' + _.formatSi(p.worked) + ' ';
    if (p.totalWork) {
        t += '(of ' + _.formatSi(p.totalWork) + ') '; 
    }
    t += 'in ' + _.formatTime(p.runningDurationMs);
    d3.select('#results-div').append('span').text(t);
    
    // Use progress facade to represent progress descriptor
    var pf = progress.ofTask(p);
    
    // Visual progress bar
    var pdiv = d3.select('#results-div').append('div');
    pf.appendProgressBarToD3(pdiv);
    
    // Textual representation
    d3.select('#results-div').append('span').text(pf.getProgressString());
    
    
}

/**
 * Set UI state to started.
 * 
 * @param e Error descriptor
 */
function setUiToError(e) {
    d3.select('#results-div').selectAll('*').remove();
    d3.select('#results-div').append('h2').text('Error');
    d3.select('#results-div').append('div').text(
        e.statusCode + ' ' + e.statusReasonPhrase
    );
    if (e.message) {
        d3.select('#results-div').append('div').text(e.message);
    }
    
}

function setUiToDistribution(d) {
    d3.select('#results-div').selectAll('*').remove();
    d3.select('#results-div').append('h2').text('Dissimilarity distribution');
    d3.select('#results-div').append('div').text('Bin values: ' + d.histogram.bins.toString());
}

function setUiToMostSimilars(d) {
    d3.select('#results-div').selectAll('*').remove();
    d3.select('#results-div').append('h2').text('Most similars');
    // Note that d3 data binding could be used instead of this loop
    var table = d3.select('#results-div').append('table').classed('table', true);
    var thr = table.append('thead').append('tr');
    thr.append('th').text('target');
    thr.append('th').text('ID');
    thr.append('th').text('dissimilarity');
    var tbody = table.append('tbody');
    for (var i = 0; i < d.targets.length; i++) {
        var row = tbody.append('tr');
        var targeti = d.targets[i];
        row.append('td').text(_.formatMostSimilar0(i));
        row.append('td').append('code').text(targeti.targetid);
        row.append('td').append('code').text(targeti.dissimilarity);
    }
    
}

/**
 * Success handler for the descriptor context.
 * 
 * The current example uses the same facade for most similars searches and for dissimilarity distribution calculations.
 * Both searches use this same result handler. In a typical deployment it is recommended to use different facades for
 * different search types or dispatch based on the result contents.
 * 
 * @param o Result object
*/
function onSuccess(o) {
    addToLogTable('green', 'Success handler', 'Operation finished, results are received from the search context', 'results', o);
    
    // check the result type
    // no explicit type info available so guess from the contents
    if (o.histogram) {
        setUiToDistribution(o);
    } else if (o.targets) {
        setUiToMostSimilars(o);
    } else {
        setUiToStarted('?');
    }
}

/**
 * Progress handler for async tasks.
 * 
 * Invoked by descriptor context facade when an async task poll is in an in-progress state. Note that when the tasl
 * completes before the first poll the progress handler might not be called at all.
 * 
 * @param o Progress state.
 */
function onProgress(o) {
    addToLogTable('yellow', 'Progress handler', 'Progress update received through the search context.', 'progress', o);
    setUiToProgress(o);
}

/**
 * Error handler for the descriptor context.
 * 
 * Invoked when an error is reported.
 * 
 * @param o Error descriptor
 */
function onError(o) {
    addToLogTable('red', 'Error handler', 'Operation failed. Error handler invoked by the search context.', 'error', o);
    setUiToError(o);
}


function updateSearchContext() {
    var server = restApiUrlInput.property('value');
    var desc = targetDescriptorInput.property('value');
    
    
    dataaccess.setUrlPrefix(server);
    addToLogTable('blue', 'Set URL prefix', 'Set MadFast embedded server location to ' + server);
    
    
    
    var opts = {
        async : true,
        desc : desc,
        success : onSuccess,
        progress : onProgress,
        error : onError
        
    };
    // workaround to display these fields in debug table. By adding toJSON() methods these function fields 
    // wont be skipped during string conversion when object is displayed from the debug table.
    // this is not needed for proper functionality of the data access layer
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
    opts.success.toJSON = function() { return '[Success handler function]'; };
    opts.progress.toJSON = function() { return '[Progress handler function]'; };
    opts.error.toJSON = function() { return '[Error handler function]'; };
    
    addToLogTable('blue', 'Create context', 'Create similarity search context for desc: ' + desc, 'Opts', opts);
    descSearchContext = createDescCtx(opts);
}

function launchMssSearch() {
    
    var query = queryStructureInput.property('value');
    
    var params = {
        query : query,
        maxCount : 5
    };
    
    addToLogTable('blue', 'Launch MSS', 'Launch most similar structures search button clicked.', 'Params', params);
    
    setUiToStarted('Most similars search started');
            
    descSearchContext.findMostSimilars(params);
    
    
}

function launchDistSearch() {
    
    var query = queryStructureInput.property('value');
    
    var params = {
        query : query,
        bincount : 15
    };
    
    setUiToStarted('Dissimilarity distribution search started');
    
    addToLogTable('blue', 'Launch distribution calc', 'Launch dissimilarity distribution calculation button clicked.', 'Params', params);
    
    descSearchContext.calculateDissimilarityDistribution(params);
}





function emptyTable() {
    logTableTbody.selectAll('*').remove();
}

function showModal(title, content) {
    // fill modal
    dataDisplayModalTitle.text(title);
    // see https://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
    dataDisplayModalContent.text(content);

    // open modal, see https://getbootstrap.com/docs/3.3/javascript/#modals
    $('#data-display-modal').modal();
    
}

function addToLogTable(t, event, description, dataLabel, data) {
    console.log('Log record added. Label:', t, 'event:', event, 'description:', description, 'dataLabel:', dataLabel, 'data:', data);
       
    // See https://getbootstrap.com/docs/3.3/components/#labels
    var cl = 'label-default';
    switch (t) {
        case 'blue':
            cl = 'label-primary'; 
            break;
        case 'red':
            cl = 'label-danger';
            break;
        case 'green':
            cl = 'label-success'; 
            break;
        case 'yellow':
            cl = 'label-warning'; 
            break;
    }
    
    var tr = logTableTbody.append('tr');
    tr.append('td').append('span').classed('label ' + cl, true).text(event);
    tr.append('td').text(description);
    var dataTd = tr.append('td');
    
    if (!!data) {
        dataLabel = dataLabel ? dataLabel : 'data';    
        
        // See https://getbootstrap.com/docs/3.3/css/#buttons 
        dataTd.append('button')
            .attr('type', 'button')
            .classed('btn btn-default btn-xs', true)
            .text(dataLabel)
            .on('click', function() {
                showModal(dataLabel, JSON.stringify(data, null, 2));
            });
    }
    
    var stack = Error().stack;
    tr.append('td').append('button')
            .attr('type', 'button')
            .classed('btn btn-default btn-xs', true)
            .text('Stack trace')
            .on('click', function() {
                showModal('Stack trace', stack);
            });
}



function initPage() {
    // look up components on the page as d3 selections
    logTableTbody = d3.select('#log-table tbody');
    restApiUrlInput = d3.select('#rest-api-url-input');
    targetDescriptorInput = d3.select('#descriptors-to-search-input');
    queryStructureInput = d3.select('#structure-source-input');
    dataDisplayModalTitle = d3.select('#data-display-modal-title');
    dataDisplayModalContent = d3.select('#data-display-modal-content');
    
    
    // init default data
    // see https://stackoverflow.com/questions/31369347/how-to-get-dynamic-value-of-input-element-with-d3
    restApiUrlInput.attr('value', 'https://disco.chemaxon.com/madfast-demo/');
    targetDescriptorInput.attr('value', 'rest/descriptors/surechembl-cfp7');
    queryStructureInput.attr('value', 'CN1C=NC2=C1C(=O)N(C)C(=O)N2C'); // caffeine SMILES
   
    // bind event handlers
    d3.select('#set-rest-api-url-button').on('click', updateSearchContext);
    d3.select('#set-descriptors-to-search-button').on('click', updateSearchContext);
    
    d3.select('#start-mss-button').on('click', launchMssSearch);
    d3.select('#start-dist-button').on('click', launchDistSearch);
    d3.select('#empty-table-button').on('click', emptyTable);
    
    // bind global error handler: errors displayed on the page
    // see https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror
    window.onerror = function(msg, url, lineNo, columNo, error) {
        var details = {
            msg: msg,
            url: url,
            lineNo: lineNo,
            columnNo: columNo,
            error: error
        };  
        addToLogTable('red', 'Script error', 'Uncaught error', 'details', details);
    };
    
    
    updateSearchContext();
    
}


// See https://stackoverflow.com/questions/34469877/jquery-ready-equivalent-in-d3js
document.addEventListener("DOMContentLoaded", initPage);