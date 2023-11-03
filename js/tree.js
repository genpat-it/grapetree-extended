let gtiz_tree = {};
gtiz_tree.original_tree = {};
gtiz_tree.filtered_nodes = [];
gtiz_tree.tree = null;
gtiz_tree.current_metadata_file = null;
gtiz_tree.metadata_grid = null;
gtiz_tree.tree_raw = undefined;
gtiz_tree.metadata_options = {};
gtiz_tree.change_counter = 0;
gtiz_tree.selectedNodeIDs = undefined;
gtiz_tree.show_node_tooltips = 'show_tooltips'; // or hide_tooltips
gtiz_tree.tree_node_tooltip = undefined;
gtiz_tree.show_hypothetical = 'show_hypo'; // or hide_hypo
gtiz_tree.rendering_mode = 'static'; // or dynamic
gtiz_tree.rendering_dynamic_selected_only = 'selected_only'; // or all
gtiz_tree.rendering_static_real_branch_length = 'real'; // or unreal
gtiz_tree.show_node_labels = 'hidden'; // or shown
gtiz_tree.node_label = undefined;
gtiz_tree.node_label_font_size = 12;
gtiz_tree.individual_segments = 'hidden';
gtiz_tree.node_radius_size = 100; // value has to be divided for 10 `tree.setNodeSize(gtiz_tree.node_radius_size / 10.);`
gtiz_tree.node_kurtosis = 100; // value has to be divided for 200 `tree.setRelativeNodeSize(gtiz_tree.node_kurtosis / 200.0);`
gtiz_tree.show_branch_labels = 'hidden'; // or shown
gtiz_tree.branch_label_font_size = 14;
gtiz_tree.branch_scaling = 100;
gtiz_tree.branch_log_scale = 'not-active'; // or active
gtiz_tree.branch_cutoffs_method = 'display'; // or hide or cap

/**
 * Get complete GrapeTree object (tree, metadata, map, settings etc.)
 * 
 * @returns Object
 */
gtiz_tree.getCompleteGrapeTreeObject = function() {
  let obj = gtiz_tree.tree.getTreeAsObject();
  obj.gtiz_locales = {
		languages : gtiz_locales.languages
	}
  if (gtiz_map.geojson && gtiz_map.geojson != '') {
		obj.gtiz_map = {
			geojson : gtiz_map.geojson
		};
	}
  obj.gtiz_layout = {
		settings : gtiz_layout.settings,
		map : gtiz_layout.map,
		metadata : gtiz_layout.metadata,
		legend : gtiz_layout.legend,
		video : gtiz_layout.video
	};
  obj.gtiz_settings = {
		cfg : gtiz_settings.cfg,
		tree : {
			rendering_mode : gtiz_tree.rendering_mode,
			rendering_dynamic_selected_only : gtiz_tree.rendering_dynamic_selected_only,
			rendering_static_real_branch_length : gtiz_tree.rendering_static_real_branch_length,
			show_node_labels : gtiz_tree.show_node_labels,
			node_label : gtiz_tree.node_label,
			node_label_font_size : gtiz_tree.node_label_font_size,
			individual_segments : gtiz_tree.individual_segments,
			node_radius_size : gtiz_tree.node_radius_size,
			node_kurtosis : gtiz_tree.node_kurtosis,
			show_branch_labels : gtiz_tree.show_branch_labels,
			branch_label_font_size : gtiz_tree.branch_label_font_size,
			branch_scaling : gtiz_tree.branch_scaling,
			branch_log_scale : gtiz_tree.branch_log_scale,
			branch_cutoffs_method : gtiz_tree.branch_cutoffs_method
		},
		map : {
			default_delta_type : gtiz_map.delta_type,
			default_delta : gtiz_map.delta,
			point_min_radius : gtiz_map.point_min_radius,
			point_max_radius : gtiz_map.point_max_radius,
			markers_type : gtiz_map.markers_type
		}
	};
  obj.gtiz_legend = {
		selection_mode : gtiz_legend.selection_mode,
		view_mode : gtiz_legend.view_mode,
		group_order : gtiz_legend.group_order,
		selection_map : gtiz_legend.getSelectionMap()
	};
  obj.gtiz_metadata = {
		show_nodes : gtiz_metadata.show_nodes,
		show_hypothetical : gtiz_metadata.show_hypothetical
	};
  obj.gtiz_video = {
		cfg : gtiz_video.cfg
	};

  return obj;
}

/**
 * Save initial(original) tree object to use it for reset tree
 * 
 */
gtiz_tree.saveOriginalTree = function() {
  let obj = gtiz_tree.getCompleteGrapeTreeObject();
  if (obj) {
    gtiz_tree.original_tree = {...obj};
  } else {
    console.log('Oops! I was unable to get complete GrapeTree as object');
  }
}

gtiz_tree.findNodes = function(nodes) {
  gtiz_map.findNodesInMap(nodes);
  gtiz_metadata.findNodes(nodes);
}

/**
 * Core function to pass selection between tree, map and legend
 * 
 * @param {Object} tree Tree object 
 * @param {Function} callback Callback function
 * @returns
 *  
 */
gtiz_tree.tree_interceptor = (tree, callback) => {
  if (!tree) {
    console.error("tree not defined");
    return;
  }
  if (!callback || typeof callback !== 'function') {
    console.error("callback not defined");
    return;
  }
  tree.addNodesSelectedListener((tree) => {
    let groupedNodes = {};
    gtiz_tree.selectedNodeIDs = tree.getSelectedNodeIDs();
    for (selectedNodeID of gtiz_tree.selectedNodeIDs) {
      groupedNodes[selectedNodeID] = tree.grouped_nodes[selectedNodeID];
    }
    callback(groupedNodes);
  });
}

gtiz_tree.setBranchLength = function(value) {
  let max = parseFloat(value);
	if (!max) {
		max = gtiz_tree.tree.max_link_distance + 1;
	}
	let method = gtiz_tree.branch_cutoffs_method;
  if (method == 'hide') {
    gtiz_tree.tree.setMaxLinkLength(gtiz_tree.tree.max_link_distance + 1);
		gtiz_tree.tree.setHideLinkLength(max);
  } else if (method == 'cap') {
    gtiz_tree.tree.setHideLinkLength(gtiz_tree.tree.max_link_distance+1);
		gtiz_tree.tree.setMaxLinkLength(max);
  } else {
    gtiz_tree.tree.setMaxLinkLength(gtiz_tree.tree.max_link_distance + 1);
    gtiz_tree.tree.setHideLinkLength(gtiz_tree.tree.max_link_distance + 1);
  }
}

gtiz_tree.setBranchLengthMethod = function(value) {
  gtiz_tree.branch_cutoffs_method = value;
  let input = document.querySelector('#tree-branch-length');
  let max = parseFloat(input.value);
  gtiz_tree.setBranchLength(max);
}

gtiz_tree.toggleBranchLogScale = function(value) {
  gtiz_tree.branch_log_scale = value;
  if (gtiz_tree.branch_log_scale == 'active') {
    gtiz_tree.tree.setLogLinkScale(true);
  } else {
    gtiz_tree.tree.setLogLinkScale(false);
  }
}

gtiz_tree.collapseBranches = function(value) {
  let v = parseFloat(value);
  gtiz_tree.tree.collapseNodes(v);
}

gtiz_tree.setBranchScaling = function(value) {
  gtiz_tree.branch_scaling = parseInt(value);
  gtiz_tree.tree.setLinkLength(gtiz_tree.branch_scaling * 5.0);
}

gtiz_tree.setBranchLabelFontSize = function(value) {
  gtiz_tree.branch_label_font_size = parseInt(value);
  gtiz_tree.tree.setLinkFontSize(gtiz_tree.branch_label_font_size);
}

gtiz_tree.toggleShowBranchLabels = function(value) {
  gtiz_tree.show_branch_labels = value;
  if (gtiz_tree.show_branch_labels == 'shown') {
    gtiz_tree.tree.showLinkLabels(true);
  } else {
    gtiz_tree.tree.showLinkLabels(false);
  }
}

gtiz_tree.setNodeKurtosis = function(value) {
  gtiz_tree.node_kurtosis = parseInt(value);
  gtiz_tree.tree.setRelativeNodeSize(gtiz_tree.node_kurtosis / 200.0);
}

gtiz_tree.setNodeRadiusSize = function(value) {
  gtiz_tree.node_radius_size = parseInt(value);
  gtiz_tree.tree.setNodeSize(gtiz_tree.node_radius_size / 10.);
}

gtiz_tree.toggleIndividualSegments = function(value) {
  gtiz_tree.individual_segments = value;
  if (value == 'shown') {
    gtiz_tree.tree.showIndividualSegments(true);
  } else {
    gtiz_tree.tree.showIndividualSegments(false);
  }
}

/**
 * Get selected value by using `display_category`
 * 
 * @returns 
 * 
 */
gtiz_tree.getNodeLabelSelectValue = function() {
  let category = gtiz_tree.tree.display_category;
  if (gtiz_tree.node_label) {
    category = gtiz_tree.node_label;
  }
  let value = category ? category : '';
  return value;
}

/**
 * Set label font size
 * 
 * @param {String} value
 * 
 */
gtiz_tree.setNodeLabelFontSize = function(value) {
  gtiz_tree.node_label_font_size = parseInt(value);
  gtiz_tree.tree.setNodeFontSize(gtiz_tree.node_label_font_size);
}

/**
 * Toggle nodes label visualization
 * 
 * @param {String} value 
 * 
 */
gtiz_tree.toggleShowNodeLabels = function(value) {
  gtiz_tree.show_node_labels = value;
  if (gtiz_tree.show_node_labels == 'shown') {
    gtiz_tree.tree.showNodeLabels(true);
  } else {
    gtiz_tree.tree.showNodeLabels(false);
  }
}

/**
 * Function to higlight label based on keywords
 * 
 * @param {String} value Value coming from input text 
 * @returns Exit from function if keywords ar not defined
 * 
 */
gtiz_tree.highlightLabels = function(value) {
  // clean legend selection
  let selection_mode = gtiz_legend.selection_mode;
  let items = document.querySelectorAll('.card-legend .list-row');
  items.forEach(item => {
    item.classList.remove('selected');
    let check = item.querySelector('.list-check');
    let icon = check.querySelector('i');
    icon.setAttribute('class', 'iconic iconic-check-circle-empty');
  });
  if (selection_mode == 'qualitative') {
    gtiz_legend.nodeSelection();
  } else {
    gtiz_legend.highlightSelection();
  }
  let node_label = document.querySelector('#tree-node-label-text');
  let category = node_label.value;
  let keyword = value;
	if (!keyword) {
    gtiz_tree.tree.clearSelection();
		return;
	}
	let ids = gtiz_tree.tree.searchMetadata(keyword, category);
	gtiz_tree.tree.highlightNodes(ids);
}

gtiz_tree.setNodeLabelMetadata = function(value) {
  gtiz_tree.node_label = value;
  gtiz_tree.tree.setNodeText(value);
}

/**
 * Get selected value by using `display_category`
 * 
 * @returns 
 * 
 */
gtiz_tree.getMetadataSelectValue = function() {
  let category = gtiz_tree.tree.display_category;
  let value = category ? category : '';
  return value;
}

/**
 * Get metadata in order to return an array to build options for select box
 * 
 * @returns Array of object to build `<option>` tags
 * 
 */
gtiz_tree.getMetadataSelectOptions = function() {
  let tree = gtiz_tree.tree;
  let options = [];
  if (tree) {
    let metadata = tree.metadata_info;
    if (metadata) {
      options = Object.keys(metadata)
      .sort()
      .map(function(category) {
        let label = metadata[category]['label'];
        if (label) {
          label = label.toLowerCase();
          label = label.charAt(0).toUpperCase() + label.slice(1) // same formula used to render legend title
        }
        let ar = {
          value : category,
          label : label
        }
        return ar;
      });
    }
  }
  return options;
}

/**
 * 
 * Changes the category displayed. If no category is given then the node IDs will be displayed.
 * 
 * changeCategory(string)
 * 
 */
gtiz_tree.setMetadata = function(value) {
  gtiz_tree.tree.changeCategory(value);
}

gtiz_tree.setRenderingStaticSelecion = function(value) {
  gtiz_tree.rendering_static_real_branch_length = value;
  if (gtiz_tree.rendering_mode == 'static') {
    if (value == 'real') {
      gtiz_tree.tree.fixAllNodes(true);
    } else {
      gtiz_tree.tree.fixAllNodes(false);
    }
  }
}

gtiz_tree.setRenderingDynamicSelecion = function(value) {
  gtiz_tree.rendering_dynamic_selected_only = value;
  if (gtiz_tree.rendering_mode == 'dynamic') {
    if (value == 'selceted_only') {
      gtiz_tree.tree.unfixSelectedNodes(false);
    } else {
      gtiz_tree.tree.unfixSelectedNodes(true);
    }
  }
};

gtiz_tree.toggleRenderingMode = function(value) {
  gtiz_tree.rendering_mode = value;
  let static_check = document.querySelector('#tree-rendering-static-real-branch-length');
  let dynamic_check = document.querySelector('#tree-rendering-dynamic-selected-only');
  if (value == 'dynamic') {
    dynamic_check.setAttribute('style', 'display: block;');
    static_check.setAttribute('style', 'display: none;');
    if (gtiz_tree.rendering_dynamic_selected_only == 'selceted_only') {
      gtiz_tree.tree.unfixSelectedNodes(false);
    } else {
      gtiz_tree.tree.unfixSelectedNodes(true);
    }
  } else {
    dynamic_check.setAttribute('style', 'display: none;');
    static_check.setAttribute('style', 'display: block;');
    if (gtiz_tree.rendering_static_real_branch_length == 'real') {
      gtiz_tree.tree.fixAllNodes(true);
    } else {
      gtiz_tree.tree.fixAllNodes(false);
    }
  }
}

gtiz_tree.toggleHypotetical = function(value) {
  gtiz_tree.show_hypothetical = value;
  gtiz_tree.tree.toggleHypotheticalNodes();
}

gtiz_tree.toggleNodeToolTipVisibility = function(value) {
  gtiz_tree.show_node_tooltips = value;
}

gtiz_tree.showToolTip = function(msg, e) {
  gtiz_tree.tree_node_tooltip = d3.select("body")
			.append("div")
			.attr("class", "tree-node-tooltip")
			.style("opacity", 0);
  if (!e) {
    e = d3.event;
  }
  gtiz_tree.tree_node_tooltip.style("z-index", 9999);
  gtiz_tree.tree_node_tooltip.transition()
    .duration(200)
    .style("opacity", .9);
  gtiz_tree.tree_node_tooltip.html(msg)
    .style("left", (e.pageX) + "px")
    .style("top", (e.pageY - 28) + "px")
    .style("height", "auto");
  // setTimeout(gtiz_tree.hideToolTip, 2000);
}

gtiz_tree.hideToolTip = function() {
  if (gtiz_tree.tree_node_tooltip) {
    gtiz_tree.tree_node_tooltip.remove();
  }
}

/**
 * Update all the select options. (No documentation provided)
 * 
 */
gtiz_tree.addMetadataOptions = function (data) {
  let options = gtiz_tree.getMetadataSelectOptions();
  let metadata_select = document.querySelector("#tree-metadata-select");
  let node_label_text = document.querySelector("#tree-node-label-text");
  if (metadata_select) {
    metadata_select.innerHTML = '';
    options.forEach(el => {
      let option = document.createElement('option');
      option.setAttribute('value', el.value);
      option.innerHTML = el.label;
      metadata_select.append(option);
    });
  }
  if (node_label_text) {
    node_label_text.innerHTML = '';
    options.forEach(el => {
      let option = document.createElement('option');
      option.setAttribute('value', el.value);
      option.innerHTML = el.label;
      node_label_text.append(option);
    });
  }
}

/**
 * On tree loaded functions. (No documentation provided)
 * 
 * @param {Object} tree Tree object
 */
gtiz_tree.treeLoaded = function(tree) {
  tree.centerGraph();
  tree.resize();
  let tree_time = gtiz_layout.getStyleTime(gtiz_layout.tree_node);
  gtiz_layout.resizeTree(tree_time);

  // gtiz_tree.metadata_grid = new D3MSMetadataTable(tree);
  // gtiz_tree.metadata_grid.updateMetadataTable();

  //update the dropdowns if new options added
  tree.addTreeChangedListener(function(type, data) {
    if (type === 'metadata_options_altered') {
      gtiz_tree.addMetadataOptions(data);
    } else if (type === 'nodes_collapased') {
      console.log('nodes_collapased: ');
      console.log(data);
    }
  });

  tree.addDisplayChangedListener(function(type, data) {
    if (type === 'category_changed') {
      let metadata_select = document.querySelector("#tree-metadata-select");
      if (metadata_select) {
        metadata_select.value = data;
      }
      if (gtiz_tree.change_counter === 1) {
        gtiz_tree.original_tree.initial_category = data;
      }
      if (gtiz_tree.change_counter >= 1) {
        let lines = document.querySelectorAll('#vis line');
        lines.forEach(line => {
          line.setAttribute('style', 'stroke: black; opacity: 1;');
        });
        let video_status = gtiz_video.status;
        if (video_status && gtiz_video.status != 'init') {
          gtiz_video.reset();
        }
        tree.clearSelection();
      }
      if (gtiz_tree.change_counter > 1) {
        if (gtiz_map.geojson != '' && gtiz_layout.map == 'on') {
          gtiz_map.init();
        }
      }
      gtiz_tree.change_counter++;
    }
  });
  
  /**
   * 
   * Adds a listener to the node segment, which is called when the mouse is over the segment
   * 
   * A callback which is called when a segment is mouse overed The functions is supplied the segment e.g. addLinkOverListener(function(segment){...});
   * 
   */
  tree.addSegmentOverListener(function(d) {
    if (gtiz_tree.show_node_tooltips == 'show_tooltips') {
      let display = d.data.type;
      gtiz_tree.showToolTip(display+ '(' + d.data.value + ')');
    }
  });

  /**
   * 
   * Adds a listener to the node, which is called when the mouse leaves the link
   * 
   * A callback which is called when the mouse leaves the link The functions is supplied the link e.g. addLinkOverListener(function(link){...});
   * 
   */
  tree.addSegmentOutListener(function(d) {
    // console.log('Mouse leaved the node');
    gtiz_tree.hideToolTip();
  });

  /**
   * 
   * Adds a listener to the node, which is called when the mouse leaves the link
   * 
   * A callback which is called when the mouse leaves the link The functions is supplied the link e.g. addLinkOverListener(function(link){...});
   * 
   */
  tree.addLinkOverListener(function(d) {
    // console.log("Length: " + d.value);
    if (gtiz_tree.show_node_tooltips == 'show_tooltips') {
      gtiz_tree.showToolTip("length:" + d.value);
    }
  });

  /**
   * 
   * Adds a listener to the node, which is called when the mouse leaves the link
   * 
   * A callback which is called when the mouse leaves the link The functions is supplied the link e.g. addLinkOverListener(function(link){...});
   * 
   */
  tree.addLinkOutListener(function(d) {
    // console.log("Mouse leaves the link.");
    gtiz_tree.hideToolTip();
  });

  /**
   * 
   * Change color from legend.
   * 
   */
  tree.legendItemCircleClicked = function(data){
    gtiz_legend.legend_colour_chooser.spectrum("set", data.colour);
    gtiz_legend.legend_colour_chooser.data({"value": data.value.split("  [")[0], "category":data.category});
    setTimeout(function(){gtiz_legend.legend_colour_chooser.spectrum("show");}, 50);
  };

  /**
   * Select an item in the legend, the function is declared in base_tree.js togheter with the listener, added during the legend build process
   * 
   * @param {Object} obj Object containing information about legend, category and clicked item
   * 
   */
  tree.legendItemClicked = function(obj) {
    let target = obj.target;
    if (!target.classList.contains('card-legend-item-circle')) {
      gtiz_legend.toggleItemSelection(obj, tree);
    }
    let video_status = gtiz_video.status;
    if (video_status && gtiz_video.status != 'init') {
      gtiz_video.reset();
    }
  };
  
  let metadata_select = document.querySelector("#tree-metadata-select");
  let node_label_text = document.querySelector("#tree-node-label-text");
  
  if (data['initial_category']) {
    if (metadata_select) {
      metadata_select.value = data['initial_category'];
    }
    if (node_label_text) {
      let value = gtiz_tree.node_label ? gtiz_tree.node_label : data['initial_category'];
			node_label_text.value = value;
    }
  } else {
    if (metadata_select) {
      metadata_select.value = data['nothing'];
    }
    if (node_label_text) {
      node_label_text.value = data['nothing'];
    }
  }

  if (data['layout_data'] && data['layout_data']['nodes_links']) {
    // setControlPanel(data['layout_data']['nodes_links'])
    console.log(data['layout_data']['nodes_links']);
  } else {
    // setControlPanel(default_control_panel_values);
    console.log('Default settings values');
  }

  if (gtiz_tree.current_metadata_file) {
    gtiz_file_handler.loadMetadataText(gtiz_tree.current_metadata_file);
  }

  // gtiz_tree.tree_interceptor(tree, (groupedNods) => console.log(groupedNods));
  gtiz_tree.tree_interceptor(tree, (groupedNods) => gtiz_tree.findNodes(groupedNods));

} //------------------------------- tree_loaded


/**
 * Tree loading status
 * 
 * @param {Object} tree Tree object
 * @param {String} msg Informative message about tree loading process status
 */
gtiz_tree.treeLoading = function(tree, msg) {
  if (msg === 'complete') {
    gtiz_tree.treeLoaded(tree);
  } else {
    console.log(msg);
  }
}

/**
 * Load tree process
 * 
 * @param {Object} data Object containing tree data coming from url parameters or files upload
 * @param {Boolean} valid if true data is to be considered as a complete json tree
 *  
 */
gtiz_tree.loadMSTree = function(data, valid) {
  gtiz_tree.metadata_options = {};
  if (gtiz_tree.tree) {
    gtiz_tree.tree.svg.remove();
    gtiz_tree.tree.legend_div[0].remove();
    gtiz_tree.tree.scale_div[0].remove();
    let metadata_select = document.querySelector('#tree-metadata-select');
    if (metadata_select) {
      metadata_select.innerHTML = '';
    }
    let metadata_map_select = document.querySelector('#metadata-map-select');
    if (metadata_map_select) {
      metadata_map_select.innerHTML = '';
    }
    let metadata_grid = document.querySelector('#metadata-div');
    if (metadata_grid) {
      metadata_grid.remove();
    }
  }
  gtiz_tree.tree = null;
  gtiz_tree.tree = new D3MSTree("graph-div", JSON.parse(JSON.stringify(data)), function(tree, msg) {
    gtiz_tree.treeLoading(tree, msg);
  });
  if (valid) {
    // controlling if data contains configurations
    let layout = data.gtiz_layout;
    let settings = data.gtiz_settings;
    let map = data.gtiz_map;
    let legend = data.gtiz_legend;
    let metadata = data.gtiz_metadata;
    let video = data.gtiz_video;
    let locales = data.gtiz_locales;
    if (map) {
      let geoJSON = map.geojson;
      if (geoJSON) {
        gtiz_map.setGeoJSON(geoJSON);
        // we need to call map definition points method due with the load JSON functions we don't call the loadMetadataText() as called by the loadNetFIles()
        // reset gtiz_map.load_count allow us to give an initial fitbounds on markers
        gtiz_map.load_count = 0;
        gtiz_map.init();
      }
    }
    if (layout) {
      gtiz_layout.settings = layout.settings;
      if (!gtiz_map.geojson || gtiz_map.geojson == '') {
        gtiz_layout.map = 'off';
      } else {
        gtiz_layout.map = layout.map;
      }
      gtiz_layout.metadata = layout.metadata;
      gtiz_layout.legend = layout.legend;
      gtiz_layout.video = layout.video;
    }
    if (settings) {
      if (settings.cfg) {
        gtiz_settings.cfg.forEach(setting => {
          let card = settings.cfg.find(element => element.card === setting.card);
          setting.expanded = card.expanded;
        });
      }
      if (settings.tree) {
        gtiz_tree.rendering_mode = settings.tree.rendering_mode;
        gtiz_tree.rendering_dynamic_selected_only = settings.tree.rendering_dynamic_selected_only;
        gtiz_tree.rendering_static_real_branch_length = settings.tree.rendering_static_real_branch_length;
        gtiz_tree.show_node_labels = settings.tree.show_node_labels;
        gtiz_tree.node_label = settings.tree.node_label;
        gtiz_tree.node_label_font_size = settings.tree.node_label_font_size;
        gtiz_tree.individual_segments = settings.tree.individual_segments;
        gtiz_tree.node_radius_size = settings.tree.node_radius_size;
        gtiz_tree.node_kurtosis = settings.tree.node_kurtosis;
        gtiz_tree.show_branch_labels = settings.tree.show_branch_labels;
        gtiz_tree.branch_label_font_size = settings.tree.branch_label_font_size;
        gtiz_tree.branch_scaling = settings.tree.branch_scaling;
        gtiz_tree.branch_log_scale = settings.tree.branch_log_scale;
        gtiz_tree.branch_cutoffs_method = settings.tree.branch_cutoffs_method;
      }
      if (settings.map) {
        gtiz_map.default_delta_type = settings.map.default_delta_type;
        gtiz_map.default_delta = settings.map.default_delta;
        gtiz_map.point_min_radius = settings.map.point_min_radius;
        gtiz_map.point_max_radius = settings.map.point_max_radius;
        gtiz_map.markers_type = settings.map.markers_type;
      }
    }
    if (legend) {
      gtiz_legend.selection_mode = legend.selection_mode,
      gtiz_legend.view_mode = legend.view_mode,
      gtiz_legend.group_order = legend.group_order
      gtiz_legend.selection_map = legend.selection_map;
    }
    if (video) {
      gtiz_video.cfg = video.cfg;
    }
    /* if (metadata) {
      gtiz_metadata.show_nodes = metadata.show_nodes;
		  gtiz_metadata.show_hypothetical = metadata.show_hypothetical;
    } */
    if (locales) {
      gtiz_locales.languages = locales.languages;
      gtiz_locales.current = gtiz_locales.getActiveLanguageTerms();
      gtiz_locales.translate();
    }
  }
  gtiz_metadata.init();
  gtiz_legend.init();
  gtiz_video.init();
  gtiz_settings.init();
  gtiz_layout.init();
  gtiz_tree.saveOriginalTree();
}

gtiz_tree.treeStaticRedraw = function() {
  gtiz_tree.tree.refreshGraph();
}

gtiz_tree.treeCenter = function() {
  gtiz_tree.tree.centerGraph();
}

gtiz_tree.originalTree = function() {
  // improve with load json functions
  /* let tree = gtiz_tree.tree_raw;
  let geojson_obj = tree.geoJson;
  if (geojson_obj) {
    gtiz_map.setGeoJSON(geojson_obj);
  }
  let text = JSON.stringify(tree);
  gtiz_file_handler.loadTreeText(text); */
  let tree = gtiz_tree.original_tree;
  if (tree) {
    let text = JSON.stringify(tree);
    gtiz_tree.current_metadata_file = null;
    gtiz_file_handler.loadTreeText(text);
  } else {
    console.log('Oops! Something went wrong.');
  }
}

/**
 * Initate tree loading
 * 
 * @param {String} msg Informative message about tree loading process
 * 
 */
gtiz_tree.initiateLoading = function(msg) {
  let tree_node = document.querySelector('#graph-div');
  if (tree_node) {
    tree_node.innerHTML = '';
  }
  let metadata_select = document.querySelector('#tree-metadata-select');
  if (metadata_select) {
    metadata_select.innerHTML = '';
  }
  let metadata_map_select = document.querySelector('#metadata-map-select');
  if (metadata_map_select) {
    metadata_map_select.innerHTML = '';
  }
  gtiz_tree.metadata_options = {};
  console.log(msg);
};

/**
 * Build modal contents
 * 
 * @param {String} mode `save` || `load`
 * 
 */
gtiz_tree.buildFileHandlerModalContents = function(mode) {
  let contents = [];
  let cfg;
  switch (mode) {
    case 'save':
      cfg = gtiz_file_handler.save_options;
      let label = document.createElement('div');
      label.setAttribute('class', 'modal-label');
      contents.push(label);
      label.innerHTML = gtiz_locales.current.select_format_to_download;
      break;
    case 'load':
      cfg = gtiz_file_handler.load_options;
      break;
    default:
      console.log(`Sorry, we are out of ${mode}.`);
  }
  let form = document.createElement('div');
  form.setAttribute('class', 'modal-form');
  cfg.forEach(item => {
    if (item.type == 'button') {
      let box = document.createElement('div'); 
      box.setAttribute('class', 'button-box');
      let a = document.createElement('a');
      a.setAttribute('class', 'modal-action');
      let icon = item.icon != '' ? '<i class="iconic ' + item.icon + '"></i> ' : '';
      a.innerHTML = icon + item.label;
      a.addEventListener('click', (e) => {
        item.function();
      });
      box.append(a);
      form.append(box);
    }
    if (item.type == 'file') {
      let box = document.createElement('div');
      box.setAttribute('class', 'input-box input-box input-box-file');
      if (item.label) {
        let label = document.createElement('div');
        label.setAttribute('class', 'form-label');
        let icon = item.icon != '' ? '<i class="iconic ' + item.icon + '"></i> ' : '';
        label.innerHTML = icon + item.label;
        box.append(label);
      }
      let label = document.createElement('label');
      label.setAttribute('for', 'm-upload-file');
      label.setAttribute('id', 'm-upload-file-label');
      label.setAttribute('class', 'input-file input-file-drag');
      label.innerHTML = '<i class="iconic iconic-upload"></i> ' + gtiz_locales.current.m_upload_file_label;
      label.addEventListener("drop", (ev) => {
        // Prevent default behavior (Prevent file from being opened)
        ev.stopPropagation();
        ev.preventDefault();
        let modal = document.querySelector('.modal');
        let feedback = modal.querySelector('.modal-feedback');
        feedback.innerHTML = '';
        let files = ev.dataTransfer.files;
        if (files.length === 1) {
          let file_name = files[0].name;
          label.innerHTML = '<i class="iconic iconic-file"></i> ' + file_name;
          item.listener(files);
        } else {
          feedback.classList.add('info');
          feedback.innerHTML = '<p><i class="iconic iconic-warning-triangle"></i> ' + gtiz_locales.current.dropped_files_alert + '</p>';
          feedback.classList.add('show');
        }
      });
      label.addEventListener("dragover", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
      });
      label.addEventListener("dragenter", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
      });
      box.append(label);
      let input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('name', 'file');
      if (item.id) {
        input.setAttribute('id', item.id);
      }
      if (item.accept) {
        input.setAttribute('accept', item.accept);
      }
      let events = ['change'];
      events.forEach((event) => {
        input.addEventListener(event, (e) => {
          let path = e.target.value;
          let file_name = path.split("\\").pop();
          file_name = file_name.slice(0, 21);
          if (file_name) {
            label.innerHTML = '<i class="iconic iconic-file"></i> ' + file_name;
            item.listener(input.files);
          }
        });
      });
      box.append(input);
      let button_box = document.createElement('div');
      button_box.setAttribute('class', 'button-box');
      let button = document.createElement('button');
      button.setAttribute('class', 'secondary');
      button.innerHTML = '<i class="iconic iconic-upload"></i> ' + gtiz_locales.current.upload;
      button.addEventListener('click', function(e) {
        item.function();
      });
      button_box.append(button);
      box.append(button_box);
      form.append(box);
    }
  });
  contents.push(form);
  return contents;
}

/**
 * Open the modal to handle saving/uploading operations
 * 
 * @param {String} mode `save` || `load`
 */
gtiz_tree.openFileHandlerModal = function(mode) {
	let title;
  let contents = gtiz_tree.buildFileHandlerModalContents(mode);
	switch (mode) {
		case 'save':
			title = gtiz_locales.current.save_grapetree;
			break;
		case 'load':
			title = gtiz_locales.current.load_grapetree;
			break;
		default:
			title = undefined;
			break;
	}
	gtiz_modal.buildModal(title, contents);
}

gtiz_tree.context_menu = [{
  type : 'toggle',
  id : 'tree-tooltip-toggle',
  options : [{
    label : () => {
      return gtiz_locales.current.show_tooltips;
    },
      value : 'show_tooltips',
      icon : 'iconic-eye'
    }, {
      label : () => {
        return gtiz_locales.current.show_tooltips;
      },
      value : 'hide_tooltips',
      icon : 'iconic-eye-off'
  }],
  selected : () => {
    return  gtiz_tree.show_node_tooltips;
  },
  function : (value) => {
    gtiz_tree.toggleNodeToolTipVisibility(value);
  }
}, {
  type : 'separator'
}, {
  type : 'button',
  label : () => {
    return gtiz_locales.current.centre_tree;
  },
  icon : 'iconic-target',
  function : () => {
    gtiz_tree.treeCenter();
  }
}, {
  type : 'button',
  label : () => {
    return gtiz_locales.current.static_redraw;
  },
  icon : 'iconic-edit',
  function : () => {
    gtiz_tree.treeStaticRedraw();
  }
}, {
  type : 'button',
  label : () => {
    return gtiz_locales.current.original_tree;
  },
  icon : 'iconic-monitor',
  function : () => {
    gtiz_context.closeContextMenu('tree');
    gtiz_tree.originalTree();
  }
}, {
  type : 'separator'
}, {
  type : 'toggle',
  id : 'tree-tooltip-toggle',
  options : [{
      label : () => {
        return gtiz_locales.current.show_hypothetical;
      },
      value : 'show_hypo',
      icon : 'iconic-eye'
    }, {
      label : () => {
        return gtiz_locales.current.show_hypothetical;
      },
      value : 'hide_hypo',
      icon : 'iconic-eye-off'
  }],
  selected : () => {
    return  gtiz_tree.show_hypothetical;
  },
  function : (value) => {
    gtiz_tree.toggleHypotetical(value);
  }
}, {
  type : 'separator'
}, {
  type : 'button',
  label : () => {
    return gtiz_locales.current.select_all;
  },
  icon : 'iconic-check-circle',
  function : () => {
    gtiz_tree.tree.selectAll();
  }
}, {
  type : 'button',
  label : () => {
    return gtiz_locales.current.deselect_all;
  },
  icon : 'iconic-minus-circle',
  function : () => {
    gtiz_tree.tree.clearSelection();
  }
}, {
  type : 'separator'
}, {
  type : 'button',
  label : () => {
    return gtiz_locales.current.collapse_selected_nodes;
  },
  icon : 'iconic-minimize',
  function : () => {
    let selected = gtiz_tree.tree.getSelectedNodeIDs();
    gtiz_tree.tree.collapseSpecificNodes(selected);
  }
}, {
  type : 'button',
  label : () => {
    return gtiz_locales.current.expand_selected_nodes;
  },
  icon : 'iconic-maximize',
  function : () => {
    let selected = gtiz_tree.tree.getSelectedNodeIDs();
    gtiz_tree.tree.collapseSpecificNodes(selected, true);
  }
}, {
  type : 'button',
  label : () => {
    return gtiz_locales.current.expand_all;
  },
  icon : 'iconic-check-circle',
  function : () => {
    gtiz_tree.tree.manual_collapsing = {};
		gtiz_tree.tree.collapseNodes(0);
  }
}, {
  type : 'separator'
}, {
  type : 'button',
  label : () => {
    return gtiz_locales.current.hide_selected_nodes;
  },
  icon : 'iconic-eye-off',
  function : () => {
    let selected = gtiz_tree.tree.getSelectedNodeIDs();
    gtiz_tree.tree.delNodes(selected);
  }
}, {
  type : 'button',
  label : () => {
    return gtiz_locales.current.show_selected_subtrees;
  },
  icon : 'iconic-eye',
  function : () => {
    let selected = gtiz_tree.tree.getSelectedNodeIDs();
    gtiz_tree.tree.delOtherNodes(selected);
  }
}, {
  type : 'button',
  label : () => {
    return gtiz_locales.current.show_whole_tree;
  },
  icon : 'iconic-relation-graph',
  function : () => {
    gtiz_tree.tree.undeleteNodes();
  }
}, {
  type : 'separator'
}, {
  type : 'button',
  label : gtiz_locales.current.save_grapetree,
  icon : 'iconic-folder',
  function : () => {
    let mode = 'save';
    gtiz_tree.openFileHandlerModal(mode);
  }
}, {
  type : 'button',
  label : gtiz_locales.current.load_grapetree,
  icon : 'iconic-file-plus',
  function : () => {
    let mode = 'load';
    gtiz_tree.openFileHandlerModal(mode);
  }
}, {
  type : 'separator'
}, {
  type : 'button',
  label : () => {
    return gtiz_locales.current.download_svg;
  },
  icon : 'iconic-photo',
  function : () => {
    let text = gtiz_tree.tree.getSVG();
    let timestamp =  Date.now();
    let name = "grapetree" + timestamp + ".svg";
    gtiz_file_handler.saveTextAsFile(text, name);
  }
}];

/**
 * Event for tree rotation
 * to be rewritten
 * 
 */
$("#rotation-icon").draggable({
  containment: ".dashboard-viewport",
  scroll: false,
  start: function(e) {
    // the_tree._dragStarted(the_tree.force_nodes[0], [$("#rotation-icon").position().left, $("#rotation-icon").position().top]);
    // USING e.clientX, e.clientY AS INITIAL PARAMETER MAKE THE ICON POSITION RELATIVE
    gtiz_tree.tree._dragStarted(gtiz_tree.tree.force_nodes[0], [e.clientX, e.clientY]);
  },
  drag: function(e) {
    gtiz_tree.tree._dragging(gtiz_tree.tree.force_nodes[0], [e.clientX, e.clientY]);
  },
  stop: function(e) {
    gtiz_tree.tree._dragEnded(gtiz_tree.tree.force_nodes[0], [e.clientX, e.clientY]);
  },
  revert: true,
  revertDuration: 10,
  helper: function() {
    return $("<div style='cursor:none'><label id='angle-text'></label></div>")
  },
});
$("#rotation-icon").on("drag", function(event, ui) {
  var x_dif = ui.helper.position().left - $("#rotation-icon").position().left;
  var y_dif = $("#rotation-icon").position().top - ui.helper.position().top;
  var angle = y_dif !== 0 ? Math.atan(x_dif / y_dif) / Math.PI * 180 : (x_dif === 0 ? 0 : (x_dif > 0 ? 90 : -90));
  if (y_dif < 0) {
    angle = 180 + angle;
  } else if (x_dif < 0) {
    angle = 360 + angle;
  }
  ui.helper.select('.angle-text').text(Math.round(angle) + '\xB0').css({
    'font-size': '1.3rem',
    'font-style': 'bold',
  });
});