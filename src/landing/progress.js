"use strict";

/*
 * Utilities for progress bar rendering based on TaskDto.
 */

import _ from '../common/lodash-mod.js';


/**
 * Wrap a TaskDto.
 *
 * @param task TaskDto to wrap
 * @returns facade
 */
export function ofTask(task) {
    _.checkFields({
        id : _.ensureString.description('Task ID'),

        name : _.ensureString.description('Task human readable name'),

        totalWork : _.ensureNull.or(_.ensureFinite),
        workUnit : _.ensureNull.or(_.ensureString),
        worked : _.ensureNonNegativeInteger.description('Work units completed'),
        done : _.ensureBoolean.description('Task done flag'),
        cancelled : _.ensureAny,
        startTimeMs : _.ensureNull.or(_.ensureNonNegativeInteger),
        runningDurationMs : _.ensureNonNegativeInteger.description('Task running time')
    }, task);


    var facade = {
        isWaitingToStart : function() { return !task.done && !task.startTimeMs; },
        isStarted : function() { return task.done || !!task.startTimeMs; },
        isDone : function() { return task.done; },
        isRunning : function() { return !!task.startTimeMs && !task.done; },
        whenDone : function(h) {
            _.ensureFunction(h, 'Callback to invoke when task is done');
            if (task.done) {
                h();
            }
            return facade;
        },
        /**
         * Append a progress bar to a D3 selection parent with the current state.
         *
         */
        appendProgressBarToD3 : function(parent) {
            var percentage = facade.getPercentage();
            var progressString = facade.getProgressString();
            // if (percentage) {
            if (task.totalWork) {
                var o = parent.append('div').style('width', '100%').style('height', '100%').style('position', 'relative').style('border', '1px solid #c8daea').classed('text-center', true);
                o.append('div').style('background-color', '#c8daea').style('width', percentage + '%').style('height', '100%').style('position', 'absolute').style('left', '0');
                o.append('div').style('vertical-align', 'middle').style('line-height', '20px').style('width', '100%').style('height', '100%').style('position', 'absolute').style('font-size', '80%').style('left', '0').text(progressString);
                o.append('span').text('.');
            } else {
                parent.append('div').style('width', '100%').style('height', '100%').classed('text-center', true).text(progressString);

            }
            return facade;
        },
        /**
         * Append status icon to D3 selection parent.
         *
         * Icon reflects the progress state: not started / running / finished.
         */
        appendStatusIconToD3 : function(parent) {
            var faclass;
            var color;
            var title;
            if (task.done) {
                // task is finished
                faclass = 'fa fa-check-circle';
                color = '#227722';
                title = 'Task is finished.';
            } else if (!task.startTimeMs) {
                // task is not started yet
                faclass = 'fa fa-pause-circle';
                color = '#c9c91d';
                title = 'Task is not started yet.';
            } else {
                // task is running
                faclass = 'fa fa-play-circle';
                color = '#2080df';
                title = 'Task is currently running.';
            }
            parent.append('i').classed(faclass, true).style('color', color).attr('title', title);
            return facade;

        },
        /**
         * Human readable string representing task progress.
         *
         * Typical UI would render the returned String over the progress bar displayed.
         */
        getProgressString : function() {
            if (!task.startTimeMs) {
                return 'Not started yet.';
            }
            // running or done
            var progressString;
            if (task.done) {
                if (task.worked <= 0) {
                    progressString = 'Done';
                } else {
                    progressString =  'All done: ' + _.formatSi(task.worked);
                    if (task.workUnit) {
                        progressString += ' ' + task.workUnit;
                    }
                };
                if (task.runningDurationMs > 0) {
                    progressString += ' in ' + _.formatTime(task.runningDurationMs);
                }
                progressString += '.';
                return progressString;
            }


            // task running
            progressString='';
            if (task.totalWork > 0) {
                // we can calculate percentage for running task
                progressString += facade.getPercentage() + ' % - ';
            }
            progressString += _.formatSi(task.worked);
            if (task.totalWork > 0) {
                progressString = progressString + ' of ' + _.formatSi(task.totalWork);
            }
            if (task.workUnit) {
                progressString += ' ' + task.workUnit;
            }
            if (task.runningDurationMs > 0) {
                progressString = progressString + ' (in ' + _.formatTime(task.runningDurationMs) + ')';
            }
            return progressString;
        },
        /**
         * Percentage of task completion.
         *
         * @returns 0 for not started / non done indeterminate tasks; 100 for done tasks
         */
        getPercentage : function() {
            if (task.done) {
                // finished tasks always 100% complete
                return 100;
            }
            if (!task.startTimeMs || !task.totalWork) {
                // non started or indeterminate tasks always 0%
                return 0;
            }

            var percentage = Math.round(100 * task.worked / task.totalWork);
            if (percentage < 0) { percentage = 0; }
            if (percentage > 100) { percentage = 100; }
            return percentage;
        }

    };


    return facade;


}
