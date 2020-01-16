export default function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);
    return (results === null || results === undefined)? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

export { getParameterByName };

export function whenParamDefined(name) {
    var val = getParameterByName(name);
    if (val) {
        return { then : function(f) { f(val); } };
    } else {
        return { then : function() {} };
    }
}
