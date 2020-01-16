// note that webpack provide is still neede for jQuery UI to work
// See https://stackoverflow.com/questions/34338411/how-to-import-jquery-using-es6-syntax

import $ from '../../node_modules/jquery/dist/jquery.min.js';

// export for others scripts to use
window.$ = $;
window.jQuery = $;
