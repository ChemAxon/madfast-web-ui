export function formatMemorySi(d) {

    var da = Math.abs(d);
    var s = d < 0 ? "-" : "";

    if (da === 0) {
        return 0;
    } else if (da < 1e3) {
        return s + d + " B";
    } else if (da < 1e6) {
        return s + Math.floor(10 * da / 1e3) / 10 + " kB";
    } else if (da < 1e9) {
        return s + Math.floor(10 * da / 1e6) / 10 + " MB";
    } else {
        return s + Math.floor(10 * da / 1e9) / 10 + " GB";
    }
}


/**
 * Format a number with one fractional digit precision with appending proper (none/k/M/G) SI suffix.
 *
 * @param d Value to format
 */
export function formatSi(d) {

    var da = Math.abs(d);
    var s = d < 0 ? "-" : "";

    if (da < 1) {
        return d;
    } else if (da < 1e3) {
        return s + Math.floor(10 * da) / 10;
    } else if (da < 1e6) {
        return s + Math.floor(10 * da / 1e3) / 10 + " k";
    } else if (da < 1e9) {
        return s + Math.floor(10 * da / 1e6) / 10 + " M";
    } else {
        return s + Math.floor(10 * da / 1e9) / 10 + " G";
    }
}

export function formatSiFloor(d) {
    return formatSi(Math.floor(d));
}

/**
 * Format a number describing memory size in bytes appending (B/KiB/MiB/GiB) suffix.
 *
 * @param d Value to format
 */
export function formatMemory(d) {

    var da = Math.abs(d);
    var s = d < 0 ? "-" : "";

    if (d === 0) {
        return 0;
    } else if (da < 1 << 10) {
        return s + da + " B";
    } else if (da < 1 << 20) {
        return s + Math.floor(10 * da / (1 << 10)) / 10 + " KiB";
    } else if (da < 1 << 30) {
        return s + Math.floor(10 * da / (1 << 20)) / 10 + " MiB";
    } else {
        return s + Math.floor(10 * da / (1 << 30)) / 10 + " GiB";
    }
}

/**
 * Format a number of ms describing long time units (mins/hours/days)
 *
 * @param d Value to dormat
 */
export function formatTimeLong(d) {
    if (d >= 60000) {


        var days = Math.floor(d / (24 * 3600 * 1000));
        d -= days * 24 * 3600 * 1000;

        var hours = Math.floor(d / (3600 * 1000));
        d -= hours * 3600 * 1000;

        var mins = Math.floor(d / (60 * 1000));
        d -= mins * 60 * 1000;

        var secs = Math.floor(d / 1000);
        d -= secs * 1000;

        var ret = '';
        if (days > 0) {
            ret += days + ' d ';
        }
        if (ret || hours > 0) {
            ret += hours + ' h ';
        }
        if (ret || mins > 0) {
            ret += mins + ' m ';
        }
        ret += secs + ' s';

        return ret;
    } else {
        return formatTime(d);
    }
}
/**
 * Format a number of ms describing time units.
 *
 * @param d Value to format
 */
export function formatTime(d) {
    var da = Math.abs(d);
    var s = d < 0 ? "-" : "";

    if (d === 0) {
        return 0;
    } else if (da < 1e-9) {
        return s + (1e12 * da) + ' fs';
    } else if (da < 1e-6) {
        return s + Math.floor(1e10 * da) / 10 + ' ps'; 
    } else if (da < 1e-3) {
        return s + Math.floor(1e7 * da) / 10 + ' ns'; 
    } else if (da < 1) {
        return s + Math.floor(1e4 * da) / 10 + ' us';
    } else if (da < 1e3) {
        return s + Math.floor(10 * da) / 10 + ' ms';
    } else {
        return s + Math.floor(10 * da / 1e3) / 10 + ' s';
    }
}

/**
 * Format k-NN neighbor name,
 *
 * @param index 1-based neighbor index
 */
export function formatMostSimilar1(index) {
    if (index < 0) {
        return index;
    } else if (index === 1) {
        return 'Most similar';
    } else if (index === 2) {
        return '2nd most similar';
    } else  if (index === 3) {
        return '3rd most similar';
    } else {
        return index + 'th most similar';
    }
};

/**
 * Format k-NN neighbor name,
 *
 * @param index 0-based neighbor index
 */
export function formatMostSimilar0(index) {
    return formatMostSimilar1(+index + 1);
};


/**
 * Replace tab and newline characters with space.
 *
 * This typically used when exporting tab separated style content.
 *
 * @param input Input String
 * @returns Input String with tab ('\t') and newline ('\n' and '\r') characters replaced with spaces.
 */
export function replaceTabNl(input) {
    return _.toString(input).replace(/[\t\n\r]/g, ' ');
}



