import '../deps/jquery-deps.js';
import * as topMsg from '../ui/ui-topmsg.js';
import './ui-common.css';
import getPageParameter from '../common/pageparam.js';


if (getPageParameter('present')) {
    $(initPresenter);
}

export function addCompactnessDropdownTo(target, iconclass) {
    target
        .dropdown(iconclass)
        .title('Select UI layout style')
        .header('Compactness')
        .item('default', function () {
            $('body').removeClass('compact');
            $('body').removeClass('very-compact');
        })
        .item('compact', function () {
            $('body').removeClass('very-compact');
            $('body').addClass('compact');
        })
        .item('very compact', function () {
            $('body').removeClass('compact');
            $('body').addClass('very-compact');
        })
        .separator()
        .checkbox(
            'Show mouse click locations for presenting',
            function(v) {
                if (v) {
                    initPresenter();
                    topMsg.info('Mouse click/drag locations will be shown for presenting.');
                } else {
                    stopPresenter();
                    topMsg.info('Presenting mode is off.');
                }
            },
            {
                checked : presenting
            }
        );

}



export function makeBodyScrollable() {
    $('body').addClass('scrollable');
}

export function makeBodyCompact() {
    $('body').removeClass('very-compact');
    $('body').addClass('compact');

}


var dd;
var dddown = false;
var presenting = false;

function presenter_down(e) {
    dddown = true;
    getPresenterDiv().css({ top: (e.pageY - 30) + 'px', left : (e.pageX - 30) + 'px'});
    getPresenterDiv().show(false);
}

function presenter_move(e) {
    if (!dddown) { return; }
    getPresenterDiv().css({ top: (e.pageY - 30) + 'px', left : (e.pageX - 30) + 'px'});

}

function presenter_up(e) {
    dddown = false;
    getPresenterDiv().css({ top: (e.pageY - 30) + 'px', left : (e.pageX - 30) + 'px'});
    getPresenterDiv().hide('fade', 500);

}

export function isPresenting() {
    return presenting;
}

function getPresenterDiv() {
    // see https://jsperf.com/jquery-element-in-dom
    // and https://jsperf.com/jquery-element-in-dom/2
    if (!dd || !jQuery.contains(document.documentElement, dd[0])) {
        // assistant is not yet added
        dd = $('<div/>', {
            style: 'pointer-events: none; position: absolute; border: 30px solid #238b45; border-radius: 30px;  z-index: 100000; display: none;'
        }).appendTo(document.body);
    }
    return dd;
}
/**
 * Init presenter assistant.
 *
 * Presenter assistant highlights mouse click/drag events.
 */
export function initPresenter() {
    if (presenting) {
        return;
    } else {
        presenting = true;
    }
    $(document.body).on('mousedown', presenter_down);
    $(document.body).on('mousemove', presenter_move);
    $(document.body).on('mouseup', presenter_up);
}

/**
 * Stop presenter functionality.
 */
export function stopPresenter() {
    if (!presenting) {
        return;
    } else {
        presenting = false;
    }
    if (dd) {
        dd.hide();
    }
    $(document.body).off('mousedown', presenter_down);
    $(document.body).off('mousemove', presenter_move);
    $(document.body).off('mouseup', presenter_up);

}
