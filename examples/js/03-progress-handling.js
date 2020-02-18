"use strict";

/**
 * Page logic for progress handling utilities.
 */


// Get MadFast WebUI client library
var M = window['EXPERIMENTAL-MADFAST-WEBUI-LIMITED'];
console.log('MadFast WebUI limited client library facade:', M);
var d3 = M.d3;
// Extended lodash
var _ = M._;
var progress = M.landing.progress;

// D3 selection of page components
// set in initPage()
var dtoJsonSource;
var bar;
var icon;
var message;




function update(src) {
    // empty visual representations
    bar.selectAll('*').remove();
    icon.selectAll('*').remove();
    message.text('');
    
    // try to parse JSON
    try {
        var dto = JSON.parse(src);
        console.log('src:', src, 'dto:', dto);
        var p = progress.ofTask(dto);
        
        message.text(
            'isWaitingToStart:  ' + p.isWaitingToStart() + '\n' +
            'isStarted:         ' + p.isStarted() + '\n' +
            'isDone:            ' + p.isDone() + '\n' +
            'isRunning:         ' + p.isRunning() + '\n' +
            'getProgressString: ' + p.getProgressString() + '\n' +
            'getPercentage:     ' + p.getPercentage() + '\n'
        );

        p.appendStatusIconToD3(icon);

        
        p.appendProgressBarToD3(bar);
        
    } catch (e) {
        console.log(e);
        message.text('ERROR!\n\nError name:    ' + e.name + '\nError message: ' + e.message);
    }
}



// Handle input change
var lastSrc = '';
function onSrcChange() {
    var src = dtoJsonSource.property('value');
    if (src === lastSrc) {
        return;
    }
    lastSrc = src;
    
    update(src);
}

function setInputToJsonObject(obj) {
    var content = JSON.stringify(obj, null, 2);
    dtoJsonSource.property('value', content);
    onSrcChange();
}

function initPage() {
    dtoJsonSource = d3.select('#dtojson');
    bar = d3.select('#progressbar');
    icon = d3.select('#statusicon');
    message = d3.select('#message');
    
    dtoJsonSource.on('keyup', onSrcChange);
    dtoJsonSource.on('change', onSrcChange);
    
    
    d3.select('#button-running-1').on('click', function() { 
        setInputToJsonObject({
            id : 'task_id',
            name : 'Task human readable name',
            totalWork : 1234,
            workUnit : 'thing',
            worked : 567,
            done : false,
            startTimeMs : 12345678,
            runningDurationMs : 2567
        });
    });
    d3.select('#button-running-2').on('click', function() { 
        setInputToJsonObject({
            id : 'task_id',
            name : 'Task human readable name',
            totalWork : null,
            workUnit : 'thing',
            worked : 567,
            done : false,
            startTimeMs : 12345678,
            runningDurationMs : 2567
        });
    });
    d3.select('#button-not-yet-started').on('click', function() { 
        setInputToJsonObject({
            id : 'task_id',
            name : 'Task human readable name',
            totalWork : null,
            workUnit : 'thing',
            worked :0,
            done : false,
            startTimeMs : null,
            runningDurationMs : 0
        });
    });
    d3.select('#button-finished-1').on('click', function() { 
        setInputToJsonObject({
            id : 'task_id',
            name : 'Task human readable name',
            totalWork : 1234,
            workUnit : 'thing',
            worked : 1234,
            done : true,
            startTimeMs : 12345678,
            runningDurationMs : 2567
        });
    });
    d3.select('#button-finished-2').on('click', function() { 
        setInputToJsonObject({
            id : 'task_id',
            name : 'Task human readable name',
            totalWork : null,
            workUnit : 'thing',
            worked : 1234,
            done : true,
            startTimeMs : 12345678,
            runningDurationMs : 2567
        });
    });
}


// See https://stackoverflow.com/questions/34469877/jquery-ready-equivalent-in-d3js
document.addEventListener("DOMContentLoaded", initPage);
