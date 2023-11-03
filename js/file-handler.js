let gtiz_file_handler = {};
gtiz_file_handler.tsv_metadata = undefined;
gtiz_file_handler.files_to_load = [];
gtiz_file_handler.save_options = [
	{
		type : 'button',
		id : 'file-handler-save-json',
		label : gtiz_locales.current.save_as_complete_json + ' (.json)',
		icon : 'iconic-file',
		function : () => {
			gtiz_file_handler.saveGrapeTreeAsJson();
		}
	}, {
		type : 'button',
		id : 'file-handler-export-nwk',
		label : gtiz_locales.current.export_newick + ' (.nwk)',
		icon : 'iconic-file-text',
		function : () => {
			let text = gtiz_tree.tree.getTreeAsNewick();
    	let timestamp =  Date.now();
    	let name = "grapetree" + timestamp + ".nwk";
    	let feedback = document.querySelector('.modal-feedback');
			if (text) {
				gtiz_file_handler.saveTextAsFile(text, name);
				feedback.innerHTML = '';
				feedback.classList.remove('show');
			} else {
				feedback.innerHTML = '<p>' + gtiz_locales.current.save_feedback_newick + '</p>';
				feedback.classList.add('show');
			}
		}
	}, {
		type : 'button',
		id : 'file-handler-export-metadata',
		label : gtiz_locales.current.export_metadata + ' (.tsv)',
		icon : 'iconic-file-text',
		function : () => {
			let text = gtiz_file_handler.tsv_metadata ? gtiz_file_handler.tsv_metadata : undefined;
			let timestamp =  Date.now();
    	let name = "metadata" + timestamp + ".tsv";
			let feedback = document.querySelector('.modal-feedback');
			if (text) {
				gtiz_file_handler.saveTextAsFile(text, name);
				feedback.innerHTML = '';
				feedback.classList.remove('show');
			} else {
				feedback.innerHTML = '<p>' + gtiz_locales.current.save_feedback_metadata + '</p>';
				feedback.classList.add('show');
			}
		}
	}, {
		type : 'button',
		id : 'file-handler-export-geojson',
		label : gtiz_locales.current.export_geoJson + ' (.geoJson)',
		icon : 'iconic-pin',
		function : () => {
			let text = gtiz_map.geojson;
    	let timestamp =  Date.now();
    	let name = "geoJson" + timestamp + ".geojson";
			let feedback = document.querySelector('.modal-feedback');
			if (text) {
				gtiz_file_handler.saveTextAsFile(text, name);
				feedback.innerHTML = '';
				feedback.classList.remove('show');
			} else {
				feedback.innerHTML = '<p>' + gtiz_locales.current.save_feedback_geojson + '</p>';
				feedback.classList.add('show');
			}
		}
	}
];
gtiz_file_handler.load_options = [
	{
		type : 'file',
		id : 'm-upload-file',
		label : gtiz_locales.current.select_a_file,
		icon : 'iconic-file',
		listener : (value) => {
			gtiz_file_handler.modalSetFilesToLoad(value);
		},
		accept : '.json, .nwk, .tsv',
		function : () => {
			gtiz_file_handler.modalLoadSelectedFiles();
		}
	}
];

gtiz_file_handler.drop_areas = document.querySelectorAll('.drop-area');

/**
 * Get file extention from string
 * 
 * @param {String} filename File name string
 * @returns string of file extension in lowercase
 * 
 */
gtiz_file_handler.getFileExtension = function(filename) {
  const dot_index = filename.lastIndexOf('.');
  if (dot_index === -1) {
    // No extension found
    return '';
  }
  return filename.substring(dot_index + 1).toLowerCase();
}

/**
 * Control if a string is a Json
 * 
 * @param {String} str 
 * @returns true/false
 * 
 */
gtiz_file_handler.isValidJSON = function(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 
 * Meta2GeoJSON
 * 
 * Transform Meta Object in geoJSON points
 * 
 */

gtiz_file_handler.Meta2GeoJSON = {
	newGeoJson: function () {
		return {
			"features": [],
			"name": "geopoints",
			"type": "FeatureCollection",
			"id_dashboard": "grapetree-gis"
		};
	},
	newPoint: function (h) {
		return {
			"geometry": {
				"coordinates": [
					h.x,
					h.y
				],
				"type": "Point"
			},
			"type": "Feature",
			"properties": {
				"codice": h.id
			}
		};
	},

	addNewPoint: function (geoJson, h) { // id,x,y
		if (h == undefined || h.id == undefined || h.id.length == 0) {
			return
		};
		h.x = Number.parseFloat(h.x);
		h.y = Number.parseFloat(h.y);
		if (Number.isNaN(h.x) || Number.isNaN(h.y)) {
			console.log('Meta2GeoJSON.addNewPoint: lat lon not a number. lon:' + h.x + ' lat:' + h.y);
			return
		};
		geoJson.features.push(this.newPoint(h));
	},

	checkMeta4geo: function (htitles) { // htitles = hash Of Metadata Titles (CSV titles)
		if (!htitles) {
			console.log("(GEO) WARNING: fallback field NOT found in metadata: '" + x + "' as " + x);
			return '';
		}
		function chk(x, params, htitles) {
			if (x in params && params[x] in htitles) {
				console.log("(GEO) found metadata field '" + params[x] + "' as " + x);
				return params[x];
			}
			if (x in htitles) {
				console.log("(GEO) fallback: found metadata field '" + x + "' as " + x);
				return x;
			}
			if (x in params && !(params[x] in htitles)) {
				console.log("(GEO) WARNING: field NOT found in metadata: '" + params[x] + "' as " + x);
			}
			if (!(x in params) && !(x in htitles)) {
				console.log("(GEO) WARNING: fallback field NOT found in metadata: '" + x + "' as " + x);
			}
			return '';
		}

		let params = gtiz_file_handler.params;
		this.xName = chk("longitude", params, htitles);
		this.yName = chk("latitude", params, htitles);
		if (this.xName == '' || this.yName == '') {
			return false;
		}
		return true;
	},

	meta2GeoJsonLonLat: function (hashOfHash, lonName, latName) {
		let geoJson = this.newGeoJson();
		for (var id in hashOfHash) {
			var h = hashOfHash[id]; // r = record
			this.addNewPoint(geoJson, {
				id: id,
				x: h[lonName],
				y: h[latName]
			});
		}
		return geoJson;
	},

	meta2GeoJson: function (hashOfHash) {
		return this.meta2GeoJsonLonLat(hashOfHash, this.xName, this.yName);
	}
}

/**
 * Get contents from file to load
 * 
 * @param {String} url Path where to get contents
 * @returns Content of the fetched file
 * 
 */
gtiz_file_handler.getData = async function (url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    });

    if (response.ok) {
      const text = await response.text(); // Await here to get the text content
      let obj = {
        text: text, // Include the text content in the object
        error: false
      };
      return obj;
    } else {
			let text = gtiz_locales.current.fetch_error + " Status: " + response.status + ". Url: " + url;
			console.log(text);
      let obj = {
        text: text,
        error: true
      };
      return obj;
    }
  } catch (error) {
    // Handle other errors, such as network issues
    console.error("Error:", error);
    let obj = {
      text: "An error occurred: " + error.message,
      error: true
    };
    return obj;
  }
}


/**
 * 
 * Rest call utility
 * 
 * @param {String} method "GET" || "POST"
 * @param {String} path url to rest service
 * @returns Return a promise with the call response as an object
 * 
 */
gtiz_file_handler.restCallUtil = function (method, path) {
  return new Promise(function(resolve, reject) {
      let xhr = new XMLHttpRequest();
      xhr.addEventListener("readystatechange", function () {
          if (this.readyState === 4) {
              let status = this.status;
              let obj = this.responseText;
              if (status >= 200 && status < 300) { // success
                  resolve(obj);
              } else { // failure
                  reject(obj);
              }
          }
      });
      xhr.open(method, path);
      xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send();
  });
}

/**
 * Show drag and drop area if net files are not present or there is an error on tree generation files.
 * 
 */
gtiz_file_handler.initTreeDropArea = function() {
	let tree_node = document.querySelector('.tree-container');
	tree_node.classList.remove('tree-loading');
	gtiz_loader.removeLoader(tree_node);
	let body = document.querySelector('body');
	body.classList.add('tree-not-defined');
}

/**
 * Get params passed by url
 * 
 * @param {*} hashBased inherited form original file handler, not used
 * @returns 
 */
gtiz_file_handler.getJsonFromUrl = function(hashBased) {
	let params = {};
  let url = location.href;
  let query_string = url.split('?')[1];
  if (query_string) {
    let param_pairs = query_string.split('&');
    param_pairs.forEach(pair => {
      let [key, value] = pair.split('=');
      let decoded_key = decodeURIComponent(key);
      let decoded_value = decodeURIComponent(value || '');
      if (params.hasOwnProperty(decoded_key)) {
        // If the key already exists, convert the value to an array
        if (Array.isArray(params[decoded_key])) {
          params[decoded_key].push(decoded_value);
        } else {
          params[decoded_key] = [params[decoded_key], decoded_value];
        }
      } else {
        params[decoded_key] = decoded_value;
      }
    });
  }
  return params;
};

/**
 * Parse metadata
 * 
 * @param {String} msg Message
 * @param {Array} lines Array of object containing the key-value pairs lines of the tsv file
 * @param {String} header_index Column headers
 * 
 */
gtiz_file_handler.parseMetadata = function(msg, lines, header_index) {
	if( msg === 'Error') {
		console.log(gtiz_locales.current.malformed_metadata_file_msg);
		let title = '<i class="iconic iconic-warning-triangle"></i> ' + gtiz_locales.current.oops;
		let contents = [];
		let content = document.createElement('p');
		content.innerHTML = gtiz_locales.current.malformed_metadata_file_msg;
		contents.push(content);
		gtiz_modal.buildNotifier(title, contents);
		gtiz_layout.body.classList.remove('tree-not-defined');
		return;
	}
	let meta = {};
	let id_name = '';
	let category = 'nothing';
	let options = {};
	if (header_index) {
		if (header_index.find(function(d) {return d == "ID"})) {
			id_name = 'ID';
		} else {
			id_name = header_index[0];
		}
		category = header_index.length > 1 ? header_index[1] : header_index[0];
		for (let i in header_index) {
			let header = header_index[i];
			options[header] = header;
		}
	} else {
		console.log('WARNING! Header index not defined.');
	}
	if (lines && typeof lines == 'object') {
		lines.forEach((line) => {
			meta[line[id_name]] = line;
		});
	}
	gtiz_tree.tree.addMetadataOptions(options);
	let metadata_select = document.querySelector('#tree-metadata-select');
	if (metadata_select) {
		metadata_select.value = category;
	}
	let node_label_text = document.querySelector("#tree-node-label-text");
	if (node_label_text) {
		let value = gtiz_tree.node_label ? gtiz_tree.node_label : category;
		node_label_text.value = value;
	}
	gtiz_tree.tree.addMetadata(meta);
	// to be changed in this way for parameters &x=title_name_longitute&y=title_name_latitudine
	if (gtiz_file_handler.Meta2GeoJSON.checkMeta4geo(options) ) { //options = hash of metadata titles
		let geoJ = gtiz_file_handler.Meta2GeoJSON.meta2GeoJson(meta);
		gtiz_map.setMetaGeoJSON(geoJ);
	} else {
		let message = '(GEO)WARNING: titles not found in metadata:' + gtiz_file_handler.Meta2GeoJSON.xName +', '+ gtiz_file_handler.Meta2GeoJSON.yName;
		console.log(message);
	}
	gtiz_tree.tree.changeCategory(category);
	gtiz_tree.tree.setNodeText(category);
  let components = ['tree', 'legend'];
	let action = 'remove';
	gtiz_layout.uiLoadingManager(components, action);
	// open legend component simulating legend click
	let legend_trigger = document.querySelector('[data-view="legend"]');
	if (legend_trigger) {
		let selection = legend_trigger.getAttribute('data-selection');
		if (selection == 'off') {
			legend_trigger.click();
		}
	}
	// to use original tree button we need gtiz_tree.tree_raw populated with an object containing also metadata, so we added the following line. Please find more in the README.md file under Dev notes paragraph
	gtiz_tree.tree_raw = gtiz_tree.tree.getTreeAsObject();
	gtiz_metadata.init();
};

/**
 * Load metadata from tsv file
 * 
 * @param {String} text Content from .tsv file
 * 
 */
gtiz_file_handler.loadMetadataText = function(text) {
	let return_data = [];
	try {
		let lines = text.split(/\r\n|\r|\n/g);
		let delimiter = (lines[0].indexOf(",") >= 0 ? "," : "\t");
		let header = lines[0].split(delimiter);
		lines.forEach(line => {
			let map = {};
			let arr = line.split(delimiter);
			for (var col in arr){
				map[header[col]] = arr[col];
			}
			return_data.push(map);
		});
		gtiz_file_handler.tsv_metadata = text;
		gtiz_file_handler.parseMetadata("OK", return_data, header);
	} catch(error){
		gtiz_file_handler.parseMetadata("Error", error.message);
	}
};

/**
 * Load file
 * 
 */
gtiz_file_handler.loadNetFiles = function() {
	let params = gtiz_file_handler.getJsonFromUrl();
	// make params available globally
	gtiz_file_handler.params = params;
	let tree = null;
  let metadata = null;
	let geo = null;
	for (let key in params) {
    if (params.hasOwnProperty(key)) {
      params[key] = params[key]
        .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
        .replace('drive.google.com/open?', 'drive.google.com/uc?')
        .replace('/blob/', '/')
        .replace('github.com', 'raw.githubusercontent.com');
      if (key === 'tree') {
        tree = params[key];
      } else if (key === 'metadata') {
        metadata = params[key];
      } else if (key === 'geo') {
				geo = params[key];
			}
    }
  }
	if (tree) {
		gtiz_file_handler.getData(tree).then((obj) => {
			if (obj.error) {
				gtiz_file_handler.initTreeDropArea();
				let title = '<i class="iconic iconic-warning-triangle"></i> ' + gtiz_locales.current.oops;
				let contents = [];
				let content = document.createElement('p');
				content.innerHTML = gtiz_locales.current.missing_net_tree_alert;
				contents.push(content);
				let feedback = '<p>' + obj.text + '</p>';
				let f_type = 'info';
				gtiz_modal.buildNotifier(title, contents, feedback, f_type);
			} else {
				let is_valid = gtiz_file_handler.isValidJSON(obj.text);
				if (is_valid) {
					gtiz_file_handler.tree_data = JSON.parse(obj.text);
					data = gtiz_file_handler.tree_data;
				} else {
					data = {};
					if (obj.text.substring(0,6) === "#NEXUS"){
						data['nexus'] = obj.text;
					} else {
						data['nwk'] = obj.text;
					}
					let layout_select = document.querySelector("#layout-select");
					data['layout_algorithm'] = layout_select ? layout_select.value : '';
				}
				// gtiz_tree.tree_raw = data;
				// gtiz_tree.loadMSTree(tree_raw);
				// to use original tree button we need gtiz_tree.tree_raw populated with an object containing also metadata please find more in the README.md file under Dev notes paragraph
				gtiz_tree.loadMSTree(data, is_valid);
				if (gtiz_tree.tree) {
					if (metadata) {
						gtiz_file_handler.getData(metadata).then((obj) => {
							if (obj.error) {
								let title = '<i class="iconic iconic-warning-triangle"></i> ' + gtiz_locales.current.oops;
								let contents = [];
								let content = document.createElement('p');
								content.innerHTML = gtiz_locales.current.missing_net_tsv_alert;
								contents.push(content);
								let feedback = '<p>' + obj.text + '</p>';
								let f_type = 'info';
								gtiz_modal.buildNotifier(title, contents, feedback, f_type);
								let components = ['tree', 'legend'];
								let action = 'remove';
								gtiz_layout.uiLoadingManager(components, action);
								gtiz_map.init();
							} else {
								gtiz_file_handler.loadMetadataText(obj.text);
								gtiz_map.init();
							}
						}).catch((err) => {
							console.log(err);
							let title = '<i class="iconic iconic-warning-triangle"></i> ' + gtiz_locales.current.oops;
							let contents = [];
							let content = document.createElement('p');
							content.innerHTML = gtiz_locales.metadata_file_generic_problem;
							contents.push(content);
							let feedback = '<p>' + err + '</p>';
							let f_type = 'info';
							gtiz_modal.buildNotifier(title, contents, feedback, f_type);
							let components = ['tree', 'legend'];
							let action = 'remove';
							gtiz_layout.uiLoadingManager(components, action);
							gtiz_map.init();
						});
					} else {
						let components = ['tree', 'legend'];
						let action = 'remove';
						gtiz_layout.uiLoadingManager(components, action);
						gtiz_map.init();
					}
				}
			}
		}).catch((err) => {
			console.log(err);
			gtiz_file_handler.initTreeDropArea();
			let title = '<i class="iconic iconic-warning-triangle"></i> ' + gtiz_locales.current.oops;
			let contents = [];
			let content = document.createElement('p');
			content.innerHTML = gtiz_locales.current.missing_net_tree_alert;
			contents.push(content);
			let feedback = '<p>' + err + '</p>';
			let f_type = 'info';
			gtiz_modal.buildNotifier(title, contents, feedback, f_type);
		});
	} else {
		gtiz_file_handler.initTreeDropArea();
		console.log('Tree not defined in url');
	}
}

gtiz_file_handler.dropFiles = function(div) {
	div.addEventListener("dragover", (event) => {
		event.preventDefault();
		event.stopPropagation();
	});
	div.addEventListener("dragenter", (event) => {
		event.preventDefault();
		event.stopPropagation();
	});
	div.addEventListener("drop", (event) => {
		event.stopPropagation();
    event.preventDefault();
    let files = event.dataTransfer.files;
		if (files.length === 1) {
			gtiz_file_handler.filesDropped(files);
		} else {
			let title = gtiz_locales.current.oops;
			let contents = [];
			let body = document.createElement('div');
			body.innerHTML = gtiz_locales.current.dropped_files_alert;
			contents.push(body);
			gtiz_modal.buildModal(title, contents);
		}
	});
}

gtiz_file_handler.loadFailed = function(msg) {
	// open modal to show loadFailed
	console.log('-------------------------');
	console.log('Load failed:');
	console.log(msg);
}

/**
 * Load tree from uploaded file contents
 * 
 * @param {Object} tree Object containing tree data coming from files upload
 * @param {Boolean} valid if true data is to be considered as a complete json tree
 * 
 */
gtiz_file_handler.loadTreeText = function(tree, valid) {
	gtiz_tree.initiateLoading("Processing tree file");
	let metadata_select = document.querySelector('#tree-metadata-select');
	let node_label_text = document.querySelector('#tree-node-label-text');
	let metadata_map_select = document.querySelector('#metadata-map-select');
	if (metadata_select) {
		metadata_select.innerHTML = '';
	}
	if (node_label_text) {
		node_label_text.innerHTML = '';
	}
	if (metadata_map_select) {
		metadata_map_select.innerHTML = '';
	}
	// give time to dialog to display
	setTimeout(function(){
		try {
			data = JSON.parse(tree);
		} catch (e) {
			data = {};
			let layout_select = document.querySelector("#layout-select");
			if (tree.toUpperCase().startsWith('#NEXUS')) {
				data['nexus'] = tree;
				data['layout_algorithm'] = layout_select ? layout_select.value : '';
			}
			else{
				data['nwk']=tree;
				data['layout_algorithm'] = layout_select ? layout_select.value : '';
			}
		}
		gtiz_tree.tree_raw = data;
		gtiz_tree.loadMSTree(gtiz_tree.tree_raw, valid);
		// we need to (re)set the category list for select box
		let metadata_options = data.metadata_options;
		if (metadata_options) {
			for (let i in metadata_options) {
				let cat = metadata_options[i].label;
				if (cat != "No Category") {
					if (metadata_select) {
						let option = document.createElement('option');
						option.setAttribute('value', cat);
						option.innerHTML = cat;
						metadata_select.append(option);
					}
					if (node_label_text) {
						let option = document.createElement('option');
						option.setAttribute('value', cat);
						option.innerHTML = cat;
						node_label_text.append(option);
					}	
					if (metadata_map_select) {
						let option = document.createElement('option');
						option.setAttribute('value', cat);
						option.innerHTML = cat;
						metadata_map_select.append(option);
					}
				}
			}
			let l_action = 'remove';
			let l_components = ['tree', 'legend'];
			gtiz_layout.uiLoadingManager(l_components, l_action);
		} else {
			let l_action = 'remove';
			let l_components = ['tree', 'legend'];
			gtiz_layout.uiLoadingManager(l_components, l_action);
		}
		let category = data.initial_category;
		if (category) {
			if (metadata_select) {
				metadata_select.value = category;
			}
			if (node_label_text) {
				let value = gtiz_tree.node_label ? gtiz_tree.node_label : category;
				node_label_text.value = value;
			}
		}
	},500);
};

gtiz_file_handler.distributeFile = function(text, filename) {
	let extension = gtiz_file_handler.getFileExtension(filename);
	gtiz_tree.current_metadata_file = null;
	if (gtiz_map.initialized) {
    gtiz_map.resetMap();
  }
	if (extension === 'json') {
		let l_action = 'add';
		let l_components = ['tree', 'map', 'legend'];
		gtiz_layout.uiLoadingManager(l_components, l_action);
		let obj = JSON.parse(text);
		let valid = true;
		gtiz_file_handler.loadTreeText(text, valid);
		let header_tag = document.querySelector('#headertag');
		header_tag.classList.add('show');
		header_tag.innerHTML = filename;
	}
	if (extension === 'nwk') {
		let l_action = 'add';
		let l_components = ['tree'];
		gtiz_layout.uiLoadingManager(l_components, l_action);
		gtiz_file_handler.loadTreeText(text);
		let header_tag = document.querySelector('#headertag');
		header_tag.classList.add('show');
		header_tag.innerHTML = filename;
	}
	if (extension === 'tsv') {
		gtiz_tree.current_metadata_file = text;
		if (gtiz_tree.tree) {
			let l_action = 'add';
			let l_components = ['tree', 'map', 'legend'];
			gtiz_layout.uiLoadingManager(l_components, l_action);
			gtiz_file_handler.loadMetadataText(text);
			gtiz_map.init();
		} else {
			let title = gtiz_locales.current.oops;
			let contents = [];
			let body = document.createElement('div');
			body.innerHTML = gtiz_locales.current.missing_tree_alert;
			contents.push(body);
			gtiz_modal.buildModal(title, contents);
			console.log(gtiz_locales.current.missing_tree_alert);
		}
	}
	if (extension == 'geojson') {
		if (gtiz_tree.tree) {
			let map_trigger = document.querySelector('[data-view="map"]');
			if (map_trigger) {
				let selection = map_trigger.getAttribute('data-selection');
				if (selection == 'off') {
					map_trigger.click();
				}
			}
			let l_action = 'add';
			let l_components = ['map'];
			gtiz_layout.uiLoadingManager(l_components, l_action);
			let geoJ = JSON.parse(text);
			gtiz_map.setGeoJSON(geoJ);
			gtiz_map.init();
		} else {
			let title = gtiz_locales.current.oops;
			let contents = [];
			let body = document.createElement('div');
			body.innerHTML = gtiz_locales.current.missing_tree_alert;
			contents.push(body);
			gtiz_modal.buildModal(title, contents);
			console.log(gtiz_locales.current.missing_tree_alert);
		}
	}
}

/**
 * Manage dropped files (from input or from drag)
 * 
 * @param {Array} files Array of files to load
 * 
 */
gtiz_file_handler.filesDropped = function(files) {
	Array.from(files).forEach(file => {
		let reader = new FileReader();
		reader.onload = (evt) => {
			let result = evt.target.result;
			let name = evt.target.filename;
			gtiz_file_handler.distributeFile(result, name);
		};
		reader.filename = file.name;
		reader.readAsText(file);
	});
}

/**
 * Save text as file.
 * 
 * @param {String} text Text to save as file
 * @param {String} name Suggested name for the file
 * 
 */
gtiz_file_handler.saveTextAsFile = function(text, name) {
	let blob = new Blob([text], { type: 'text/plain' });
  let url = URL.createObjectURL(blob);
	let link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


gtiz_file_handler.saveGrapeTreeAsJson = function() {
	let obj = gtiz_tree.getCompleteGrapeTreeObject();
	if (obj) {
		let text = JSON.stringify(obj);
		let timestamp =  Date.now();
		let name = "grapetree" + timestamp + ".json";
		let feedback = document.querySelector('.modal-feedback');
		if (text) {
			gtiz_file_handler.saveTextAsFile(text, name);
			feedback.innerHTML = '';
			feedback.classList.remove('show');
		} else {
			feedback.innerHTML = '<p>' + gtiz_locales.current.save_feedback_json + '</p>';
			feedback.classList.add('show');
		}
	} else {
		console.log('Oops! I was unable to get GrapeTree as object.');
	}
}

gtiz_file_handler.modalLoadSelectedFiles = function() {
	let files = gtiz_file_handler.files_to_load;
	if (files.length > 0) {
		gtiz_file_handler.filesDropped(files);
		gtiz_settings.closeModal();
		let gtiz_context_node = document.querySelector('.context-menu');
		if (gtiz_context_node) {
			gtiz_context.closeContextMenu();
		}
	} else {
		let feedback_node = document.querySelector('.modal-feedback');
    feedback_node.classList.add('show');
    feedback_node.innerHTML = '<p>' + gtiz_locales.current.select_file_msg + '</p>';
	}
}

/**
 * Set file list to load
 * 
 * @param {Array} files 
 * 
 */
gtiz_file_handler.modalSetFilesToLoad = function(files) {
	gtiz_file_handler.files_to_load = files;
};

window.addEventListener('DOMContentLoaded', function(e) {
	gtiz_file_handler.drop_areas.forEach(drop_area => {
		gtiz_file_handler.dropFiles(drop_area);
	});
	let l_action = 'add';
	let l_components = ['tree', 'map', 'legend'];
	gtiz_layout.uiLoadingManager(l_components, l_action);	
	gtiz_tree.initiateLoading("Waiting for tree...");
	gtiz_file_handler.loadNetFiles();
});