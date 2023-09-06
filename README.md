# COHESIVE - GrapeTree extended version

## Description

The project is based on [GrapeTree](https://github.com/achtman-lab/GrapeTree), a fully interactive, tree visualization program within EnteroBase, which supports facile manipulations of both tree layout and metadata. Please see more info [here](https://enterobase.readthedocs.io/en/latest/grapetree/grapetree-about.html).

The idea was to extend the original project in order to conducts spatio-temporal analyses with an integrated geographic information system (GIS) as well as a data visualization system across time. The web application allows users to upload geographic coordinates and temporal data related to each sample and allows to display them reflecting the selection in the tree on the map and vice versa, and reproducing a timelapse visualization both in the map and in the tree.

## Use GrapeTree extended version

You can download the project and easly running it locally, but we provide also a ready to use version freely available following link below:

* [https://cohesive.izs.it/grapetree/extended](https://cohesive.izs.it/grapetree/extended)

Please note, you can load sensitive data, your dataset is visualised client-side in the browser. No data is transmitted, and no tracking cookies are used. The only data downloaded from the internet are the visualisation (JavaScript) code, fonts and map tiles.

## Instruction to run it locally

To run the project locally you need to set a web server, **node packages http-server** or **live-server** works pretty fine.

### Prerequisites

* **Node js**. Download the latest stable release of NodeJS from [https://nodejs.org](https://nodejs.org) and install it using all the default options.

### Install and use live-server

Now you will be able to install `live-server` globally on your machine using the node package manager `npm` command line tool, this will allow you to run a web server from anywhere on your computer.

`npm install live-server -g`

To start a web server, in terminal open the directory containing your static web files and start the server with the following command:

`live-server`

### Run GrapeTree locally

Download the .zip of the code from this repository, then unzip on a directory `DIR_GRAPETREE` (for example: `/tmp/grapetree-extended`).

**Source files in place**

Produce your newick (`tree.nwk`) and metadata (`meta.tsv`) files and copy them inside `DIR_GRAPETREE`, then on terminal:

`live-server DIR_GRAPETREE`

Now you will be able to load data by url in your web browser, for example:

`http://localhost:8080?tree=tree.nwk&metadata=metadata.tsv`

In the project you will find a `datasets` folder with some example data to load, you can use url to see them as well:

`http://localhost:8080?tree=/datasets/test/tree.nwk&metadata=/datasets/test/metadata.tsv&geo=/datasets/test/points.geojson`

### Load geoJSON or cooridates data

The dashboard is able to recognize `.geojson` file passed as `geo` parameter by query string:

`&geo=points.geojson`

Alternatively you can integrate in `metadata.tsv` longitute and latitude values and pass them as query string parameters in the place of geoJSON. For example, if in the `.tsv` you define `x` for longitude and `y` for latitude, just add `&longitude=x&latitude=y` in the url in this way:

`&metadata=metadata.tsv&longitude=x&latitude=y`

Using our data example:

`http://localhost:8080?tree=/datasets/test/tree.nwk&metadata=/datasets/test/metadata.tsv&longitude=x&latitude=y`

> **Important**
>
> If you use `longitude` and `latitude` to name coordinates in the `.tsv` file, there is no need to pass them as query string parameters, so simply use:

`&metadata=metadata.tsv`

### Load files

The can also directly upload files by dragging them over the tree, over the initial droppable area or using load buttons provided in the UI. In this case you don't neet to user parameters in the url. You can drag or load a `.nwk` file followed by a `.tsv` file containing metadata and optionally a `.geojson` file containing geo-saptial information.

> **Important**
>
> .nwk file should be loaded before loading metadata or geoJson files.

### Save or load a compatible JSON file

Dashboard allows you to download a complete JSON file including metadata and configurations. Generated JSON file can be loaded with the same drag or load functionalities seen previously, this is very useful if you want to save your work or share it.

## Available Languages and translations

Currently, the available languages are English and Italian. However, the application can be easily extended with new translations. If you would like to contribute, you can use the `en.js` or `it.js` file as a template from the `i18n` folder in this repository and translate the values. For any information or support regarding this, do not hesitate to contact bionformatica@izs.it.

## Documentation

* [https://cohesive.izs.it/wiki/user/Dashboards/GrapeTree/GrapeTree.html](https://cohesive.izs.it/wiki/user/Dashboards/GrapeTree/GrapeTree.html)
* [https://enterobase.readthedocs.io/en/latest/grapetree/grapetree-about.html](https://enterobase.readthedocs.io/en/latest/grapetree/grapetree-about.html)

## Credits

### Tree

* [https://github.com/achtman-lab/GrapeTree](https://github.com/achtman-lab/GrapeTree)

### Map

* [https://www.openstreetmap.org/](https://www.openstreetmap.org/)
* [https://leafletjs.com/](https://leafletjs.com/) 

### Metadata table

* [https://github.com/ag-grid/ag-grid](https://github.com/ag-grid/ag-grid)

### Legend

* [https://github.com/bgrins/spectrum](https://github.com/bgrins/spectrum)
