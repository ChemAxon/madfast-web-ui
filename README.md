MadFast WebUI
=============


This repository contains parts of the [MadFast](https://disco.chemaxon.com/products/madfast/latest/) WebUI sources to be 
used as a reference. 

The MadFast REST API client functionality is exposed with its internal dependencies. Modifications were made to make 
this subset compilable. The supplied examples (in `examples/`) exercise these functionalities as a demonstration.


Getting started
---------------

Check live demos at <https://chemaxon.github.io/madfast-web-ui/>.

To build the limited 
[Web UI JS client library](https://disco.chemaxon.com/products/madfast/latest/doc/using-webui-js-library.html):

```` bash
git clone https://github.com/ChemAxon/madfast-web-ui
cd madfast-web-ui
npm install
npm run build
````

And open file `index.html` in a browser. To launch a MadFast REST server locally follow its 
[getting started guide](https://disco.chemaxon.com/products/madfast/latest/doc/getting-started-guide.html).


Repo structure
--------------

 - `dist/`: Directory for compiled code and assets. 
 - `examples/`: Example pages and code for this project. The pages depend on the contents of `dist/` and the example 
   javascript codes are not compiled, they are ES5 compatible.
 - `src/`: Subset of MadFast Web UI sources. They are compiled using WebPack.


Notes, limitations, plans
-------------------------

 - Not the whole [MadFast](https://disco.chemaxon.com/products/madfast/latest/) Web UI is 
   contained. The current state focuses on the REST API client functionality.

 - Parts of this repository are diverged from the Web UI sources used in the distribution in
   order to make the code compilable outside ChemAxon development environment. 

 - The MadFast WebUI distribution is built from an independent proprietary code base. It
   currently does not depend on this repository.

 - Parts of the REST API client functionality depend on Web UI and other internal tooling functionalities. These
   dependencies (and their transitive ones) make the compiled bundles excessively large. 
   We plan to cut these dependencies in the future and further break up the codebase into
   smaller modules.

 - Both [jQuery](https://jquery.com) / [jQuery UI](https://jqueryui.com/) and [D3.js](https://d3js.org/) are used by the
   Web UI. In the future relying on D3 is preferred.

 - Suggestions, questions and feedbacks are welcome. Feel free to contact us at 
   [madfast-support@chemaxon.com](mailto:madfast-support@chemaxon.com?subject=Question%20regarding%20https://github.com/ChemAxon/madfast-web-ui).


