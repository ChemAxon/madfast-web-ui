import '../../node_modules/highlight.js/styles/idea.css';
import './highlight-deps.css';
import hljs from '../../node_modules/highlight.js/lib/highlight.js';
import json from '../../node_modules/highlight.js/lib/languages/json.js';
import xml from '../../node_modules/highlight.js/lib/languages/xml.js';


hljs.registerLanguage('json', json);
hljs.registerLanguage('xml', xml);

export default hljs;
