"use strict";

/**
 * Messages on the top of the screen.
 */


import './ui-topmsg.css';
import '../deps/jquery-deps.js';
import '../deps/jquery-ui-deps.js';
import getLog from '../common/getlog.js';
var log = getLog('top-messager');


export function topMsg(message, err) {

    (err?log.error:log)(message, 'error:', err);

    var messageContainer = $('div.simsearch-topmessage-container').first();
    if (messageContainer.length === 0) {
        // prepend message container to the page
        messageContainer = $("<div/>", {'class' : "simsearch-topmessage-container"}).prependTo("body");
    }

    var msg =
            $("<div/>", {'class' : "simsearch-topmessage" + (err?" err":" info")}).append(
                $("<div>", {'class' : "simsearch-topmessage-icon"}).append(
                    $("<i/>", {'class' : "fa " + (err?"fa-exclamation-triangle":"fa-info-circle") + " fa-fw"})
                )
            ).append(
                $("<div/>", {text : " " + message})
            ).hide().appendTo(messageContainer);

    setTimeout(function() { msg.hide("fade", 500, function () { msg.remove(); });  }, 2500);
    msg.show("fade", 500);

};

/**
 * Display an info message on the top of the screen.
 *
 * @param m Message to display
 */
export function topInfo(m) { topMsg(m, false); };
export const info = topInfo;

/**
 * Display an error message on the top of the screen.
 *
 * @param m Message to display
 */
export function topErr(m) { topMsg(m, true); };
export const error = topErr;




