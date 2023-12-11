let gtiz_map = {};

gtiz_map.initialized = false;
gtiz_map.load_count = 0;
gtiz_map.point_min_radius_default = 24;
gtiz_map.point_max_radius_default = 55;
gtiz_map.point_min_radius = gtiz_map.point_min_radius_default;
gtiz_map.point_max_radius = gtiz_map.point_max_radius_default;
gtiz_map.default_delta_type = 'geographical'; // or metadata
gtiz_map.default_delta = 8;
gtiz_map.delta_type = gtiz_map.default_delta_type;
gtiz_map.max_delta = 8;
gtiz_map.min_delta = 0;
gtiz_map.delta = gtiz_map.default_delta;
gtiz_map.markers_type = 'piechart'; // or heatmap
gtiz_map.clustering_base = 2; // changing the base value will change the sensibility of the geographical delta for clustering
gtiz_map.samples_amount = [];
gtiz_map.samples_colors_index = [];
gtiz_map.geojson_from_metadata = ''; // populated if .tsv contains coordinates
gtiz_map.geojson = ''; // to be populated on loadJSON

gtiz_map.map_container = document.querySelector('.map-container');

/**
 * 
 * HEX to RGB converter
 * [https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb](https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb)
 * 
 */
gtiz_map.hexToRgb = function (hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: 1
  } : null;
}

/**
 * Open map component by simulating click on map layout toggle button
 * 
 */
gtiz_map.openMapComponent = function () {
  let map_trigger = document.querySelector('[data-view="map"]');
  if (map_trigger) {
    let selection = map_trigger.getAttribute('data-selection');
    if (selection == 'off') {
      map_trigger.click();
    }
  }
}

gtiz_map.toggleMarkerType = function(value) {
  if (value) {
    gtiz_map.markers_type = value;
    gtiz_map.defineMarkers();
  } else {
    console.log('Oops! Value not defined.');
  }
}

gtiz_map.setMaxMarkerValue = function(value) {
  if (value) {
    gtiz_map.point_max_radius = parseInt(value);
    gtiz_map.defineMarkers();
  }
}

gtiz_map.setMinMarkerValue = function(value) {
  if (value) {
    gtiz_map.point_min_radius = parseInt(value);
    gtiz_map.defineMarkers();
  }
}

gtiz_map.resetMinMaxMarkerValues = function() {
  let min_input = document.querySelector('#map-point-min-radius');
  let max_input = document.querySelector('#map-point-max-radius');
  gtiz_map.point_min_radius = gtiz_map.point_min_radius_default;
  gtiz_map.point_max_radius = gtiz_map.point_max_radius_default;
  min_input.value = gtiz_map.point_min_radius;
  max_input.value =  gtiz_map.point_max_radius;
  gtiz_map.defineMarkers();
}

gtiz_map.getMaxMarkerValues = function() {
  let value = gtiz_map.point_max_radius;
  return value;
}

gtiz_map.getMinMarkerValues = function() {
  let value = gtiz_map.point_min_radius;
  return value;
}

gtiz_map.resetMapDelta = function() {
  let delta = gtiz_map.default_delta;
  let type = gtiz_map.default_delta_type;
  let nodes = gtiz_tree.filtered_nodes;
  gtiz_map.delta = delta;
  gtiz_map.delta_type = type;
  let box = document.querySelector('#map-aggregation-toggle');
  let toggle = box.querySelector('.toggle');
  let label = box.querySelector('.label');
  let cfg = gtiz_map.context_menu;
  let item = cfg.find(el => el.id == 'map-aggregation-toggle');
  toggle.classList.add('toggled-first-option');
  toggle.classList.remove('toggled-second-option');
  let value = item.options[0].value;
  box.setAttribute('data-selection', value);
  label.innerHTML = ' ' + item.options[0].label;
  let select = document.querySelector('#map-delta-select');
  select.innerHTML = '';
  let options = gtiz_map.getMapDeltaSelectOptions();
  options.forEach(el => {
    let option = document.createElement('option');
    option.setAttribute('value', el.value);
    option.innerHTML = el.label;
    select.append(option);
  });
  select.value = delta;
  gtiz_map.init();
}

gtiz_map.setMapDelta = function(value) {
  let type = gtiz_map.delta_type;
  let delta = type == 'geographical' ? parseInt(value) : value;
  let nodes = gtiz_tree.filtered_nodes;
  gtiz_map.delta = delta;
  gtiz_map.init();
};

gtiz_map.getMapDeltaSelectDefault = function() {
  let type = gtiz_map.default_delta_type;
  let value = '';
  if (type == 'geographical') {
    value = gtiz_map.default_delta;
  } else {
    if (gtiz_map.default_delta && typeof gtiz_map.default_delta === 'string') {
      value = gtiz_map.default_delta;
    } else if (gtiz_map.delta && typeof gtiz_map.delta === 'string') {
      value = gtiz_map.delta;
    } else {
      value = gtiz_tree.tree.display_category;
    }
  }
  return value;
}

gtiz_map.getMapDeltaSelectOptions = function() {
  let type = gtiz_map.delta_type;
  let options = [];
  if (type == 'geographical') {
    let min = gtiz_map.min_delta;
    let max = gtiz_map.max_delta;
    for (let i = min; i <= max; i++) {
      let obj = {
        label : i,
        value : i
      }
      options.push(obj);
    }
  } else {
    let metadata = Object.entries(gtiz_tree.tree.metadata_info);
    metadata.forEach(element => {
      let obj = {
        label : element[0],
        value : element[1].label
      }
      options.push(obj);
    });
  }
  return options;
};

gtiz_map.toggleAggregationMode = function(value) {
  if (value) {
    gtiz_map.delta_type = value;
    let select = document.querySelector('#map-delta-select');
    select.innerHTML = '';
    let options = gtiz_map.getMapDeltaSelectOptions();
    options.forEach(el => {
      let option = document.createElement('option');
      option.setAttribute('value', el.value);
      option.innerHTML = el.label;
      select.append(option);
    });
    let select_value = value == 'geographical' ? gtiz_map.default_delta : gtiz_tree.tree.display_category;
    gtiz_map.delta = select_value;
    select.value = select_value;
    gtiz_map.setMapDelta(select_value);
  } else {
    console.log('Oops! Value not defined.');
  }
}

gtiz_map.setMetaGeoJSON = function (geoJ) {
  if (geoJ) {
    function isString(obj) {
      return typeof obj === "string";
    }
    if (!isString(geoJ)) {
      gtiz_map.geojson_from_metadata = JSON.stringify(geoJ);
    } else {
      gtiz_map.geojson_from_metadata = geoJ;
    }
  }
}

gtiz_map.setGeoJSON = function (geoJ) {
  if (geoJ) {
    function isString(obj) {
      return typeof obj === "string";
    }
    if (!isString(geoJ)) {
      gtiz_map.geojson = JSON.stringify(geoJ);
    } else {
      gtiz_map.geojson = geoJ;
    }
  }
}

/**
 * 
 * Set the control panel for the map, it has to be called on json load process and on tree load process when metadata are defined.
 * 
 */
gtiz_map.setMapControlPanel = function() {
  // to redefine
  console.log('Set map control card');
}

/**
 * 
 * Show/Hide sample list in the point popup
 * 
 */
gtiz_map.toggleSampleListView = function (e) {
  let target = e.currentTarget;
  let contents = target.parentNode.parentNode;
  let samples_box = contents.querySelector(".pu-samples-list-container");
  if (target.classList.contains('shown')) {
    samples_box.classList.remove('show');
    target.classList.remove('shown');
    target.innerHTML = gtiz_locales.current.show_sample_list;
  } else {
    samples_box.classList.add('show');
    target.classList.add('shown');
    target.innerHTML = gtiz_locales.current.hide_sample_list;
  }
} // toggleSampleListView

/**
 * Select all samples in a point
 * 
 */
gtiz_map.samplesSelection = function (e) {
  let contents = e.currentTarget.parentNode.parentNode;
  let info = contents.querySelector('ul.point-popup-info');
  let selected_info = info.querySelector('.point-popup-info-selected');
  let links = contents.querySelectorAll('a.pu-sample-link');
  let codes = [];
  links.forEach(link => {
    if (!link.classList.contains('warning')) {
      let link_code = link.getAttribute('data-code');
      if (link_code) {
        codes.push(link_code);
        link.classList.add('p-selected');
      }
    }
  });
  gtiz_tree.tree.selectNodesByIds(codes);
  // Now we update information about selected samples
  let selected = contents.querySelectorAll('.p-selected').length;
  if (selected && selected > 0) {
    selected_info.innerHTML = gtiz_locales.current.selected_samples + ' <span class="info-number">' + selected + '</span>';
  } else {
    selected_info.innerHTML = gtiz_locales.current.no_sample_selected + ' <span class="info-number"></span>';
  }
} // samplesSelection

/**
 * 
 * Deselect all samples in a point
 * 
 */
gtiz_map.samplesDeselection = function (e) {
  let contents = e.currentTarget.parentNode.parentNode;
  let info = contents.querySelector('ul.point-popup-info');
  let selected_info = info.querySelector('.point-popup-info-selected');
  let links = contents.querySelectorAll('a.pu-sample-link');
  let codes = [];
  links.forEach(link => {
    let link_code = link.getAttribute('data-code');
    if (link_code) {
      codes.push(link_code);
      link.classList.remove('p-selected');
    }
  });
  gtiz_tree.tree.unselectNodesByIds(codes);
  // Now we update information about selected samples
  selected_info.innerHTML = gtiz_locales.current.no_sample_selected + ' <span class="info-number"></span>';
} // samplesDeselection

/**
 * 
 * Sample selection
 * 
 */
gtiz_map.sampleSelection = function (sample, code, ctrl) {
  let contents = sample.parentNode.parentNode;
  let info = contents.querySelector('ul.point-popup-info');
  let selected_info = info.querySelector('.point-popup-info-selected');

  if (!sample.classList.contains('p-selected')) {
    if (ctrl) {
      sample.classList.add('p-selected');
      gtiz_tree.tree.selectNodesByIds(code);
      /**
       * We need to detect which of the other samples in the pop up is selected when we click on a sample link.So we match if samples contained in the popup corresponds to the samples selected on the tree. If yes we assign a `p-selected` class witch control the aspect.
       * 
       */
      let s_nodes = gtiz_tree.tree.getAllSelectedNodesIDs();
      let parent = sample.parentNode;
      let links = parent.querySelectorAll('a.pu-sample-link');
      links.forEach(link => {
        let link_code = link.getAttribute('data-code');
        if (s_nodes.includes(link_code) && !link.classList.contains('p-selected')) {
          link.classList.add('p-selected');
        }
      });
    } else {
      // insert here a modal box with the alert message
      alert("Oops! It seems that the selected sample does not have a match on GrapeTree.");
    }
  } else {
    sample.classList.remove('p-selected');
    gtiz_tree.tree.unselectNodesByIds(code);
    /**
     * We need to detect which of the other samples in the pop up is not selected when we click on a sample link to deselcet it. So we match if samples contained in the popup not corresponds to the samples selected on the tree. If yes we remove the `p-selected` class witch control the aspect.
     * 
     */
    let s_nodes = gtiz_tree.tree.getAllSelectedNodesIDs();
    let parent = sample.parentNode;
    let links = parent.querySelectorAll('a.pu-sample-link');
    links.forEach(link => {
      let link_code = link.getAttribute('data-code');
      if (!s_nodes.includes(link_code) && link.classList.contains('p-selected')) {
        link.classList.remove('p-selected');
      }
    });
  }
  
  // Now we update information about selected samples
  let selected = contents.querySelectorAll('.p-selected').length;
  if (selected && selected > 0) {
    selected_info.innerHTML = gtiz_locales.current.selected_samples + ' <span class="info-number">' + selected + '</span>';
  } else {
    selected_info.innerHTML = gtiz_locales.current.no_sample_selected + ' <span class="info-number"></span>';
  }
} // sampleSelection

/**
 * 
 * Init map
 * 
 */
gtiz_map.initMap = () => {
  if (gtiz_map.initialized) {
    map.off();
    map.remove();
  }
  this.map = L.map('map-div', { zoomControl: false }).setView([42.00, 13.00], 5);
  this.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    zoomSnap: 0,
    noWrap: true,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(this.map);
  gtiz_map.initialized = true;
  /**
   * Allow drag until world edges and avoid empty spaces
   * 
   */
  let southWest = L.latLng(-89.98155760646617, -180);
  let northEast = L.latLng(89.99346179538875, 180);
  let bounds = L.latLngBounds(southWest, northEast);
  map.setMaxBounds(bounds);
  map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
  });
  /**
   * Set min zoom to avoid empty space around world edges
   * 
   */
  let width = gtiz_map.map_container.clientWidth;
  let height = gtiz_map.map_container.clientHeight;
  let min_zoom = Math.ceil(Math.log2(Math.max(width, height) / 256));
  map.setMinZoom(min_zoom);
} // initMap

gtiz_map.resetMap = function() {
  if (gtiz_map.initialized) {
    map.off();
    map.remove();
    gtiz_map.initialized = false;
    gtiz_map.load_count = 0;
    gtiz_map.geojson_from_metadata = '';
    gtiz_map.geojson = '';
    gtiz_map.map_container.classList.remove('map-initialized');
  }
}

/**
 * 
 * Calculate point radius
 * 
 * 
 */
gtiz_map.calculatePointRadius = (samples_number) => {
  let samples_amount = gtiz_map.samples_amount;
  // get min and max interval from samples_amount
  let min_samples = Math.min(...samples_amount);
  let max_samples = Math.max(...samples_amount);
  let min_radius = gtiz_map.point_min_radius;
  let max_radius = gtiz_map.point_max_radius;
  let samples_interval = max_samples - min_samples;
  let radius_interval = max_radius - min_radius;
  let point_radius;

  if (samples_number > 0) {
    if (samples_number == min_samples) {
      point_radius = min_radius;
    }
    if (samples_number == max_samples) {
      point_radius = max_radius;
    }
    if ((samples_number < max_samples) && (samples_number > min_samples)) {
      point_radius = ((samples_number * radius_interval) / samples_interval) + min_radius;
    }
  } else {
    point_radius = 0;
  }
  
  return point_radius;

} // calculatePointRadius

gtiz_map.alterMarkers = (colors) => {
  if (colors) {
    let paths = document.querySelectorAll('.pie-chart path');
    paths.forEach(path => {
      let fill = path.getAttribute('fill');
      if (colors.includes(fill)) {
        if (gtiz_map.markers_type == 'heatmap') {
          path.setAttribute('style', 'opacity: 0.8; filter: blur(20px);');
        } else {
          path.setAttribute('style', 'opacity: 0.7;');
        }
      } else {
        if (gtiz_map.markers_type == 'heatmap') {
          path.setAttribute('style', 'opacity: 0.1; filter: grayscale(80%) blur(20px);');
        } else {
          path.setAttribute('style', 'opacity: 0.1; filter: grayscale(80%);');
        }
      }
    });
  }
}

gtiz_map.getPopUp = (samples) => {
  let popup = document.createElement('div');
  popup.setAttribute('class', 'point-popup-contents');
  let ul = document.createElement('ul');
  ul.setAttribute('class', 'point-popup-info');  
  let li_first = document.createElement('li');
  li_first.innerHTML = gtiz_locales.current.total_samples + ' <span class="info-number">' + samples.length + '</span>';
  let li_second = document.createElement('li');
  li_second.setAttribute('class', 'point-popup-info-selected');
  ul.append(li_first);
  ul.append(li_second);
  popup.append(ul);
  let sel_utils = document.createElement('div');
  sel_utils.setAttribute('class', 'point-popup-utilities');
  let select_all_u = document.createElement('a');
  select_all_u.innerHTML = gtiz_locales.current.select_all;
  select_all_u.addEventListener('click', e => {
    gtiz_map.samplesSelection(e);
  });
  let deselect_all_u = document.createElement('a');
  deselect_all_u.innerHTML = gtiz_locales.current.deselect_all;
  deselect_all_u.addEventListener('click', e => {
    gtiz_map.samplesDeselection(e);
  });
  sel_utils.append(select_all_u);
  sel_utils.append(deselect_all_u);
  popup.append(sel_utils);
  let popup_utils = document.createElement('div');
  popup_utils.setAttribute('class', 'point-popup-utilities');
  let toggle_view_u = document.createElement('a');
  toggle_view_u.setAttribute('id', 'point-popup-toggle-sample-view');
  toggle_view_u.innerHTML = gtiz_locales.current.show_sample_list;
  toggle_view_u.addEventListener('click', e => {
    gtiz_map.toggleSampleListView(e);
  });
  popup_utils.append(toggle_view_u);
  popup.append(popup_utils);
  let sample_list_box = document.createElement('div');
  sample_list_box.setAttribute('class', 'pu-samples-list-container');
  let sample_list_label = document.createElement('div');
  sample_list_label.setAttribute('class', 'label label-select-tree');
  sample_list_label.innerHTML = gtiz_locales.current.select_grapetree_message;
  sample_list_box.append(sample_list_label);
  samples.forEach(sample => {
    sample_list_box.append(sample);
  });
  popup.append(sample_list_box);
  
  return popup;
}

gtiz_map.getPopUpSampleLink = (all, nodes, code, color) => {
  let link = document.createElement('a');
  let str_code = code.replaceAll(/[./]/g, '');
  let id = 'p-' + str_code;
  let cls;
  let ctrl = true;
  let link_inner;
  if (nodes.includes(code)) {
    cls = 'pu-sample-link';
    link_inner = '<span style="background-color: ' + color + '"></span> ' + code;
  } else if (all.includes(code) && !nodes.includes(code)) {
    cls = 'pu-sample-link warning warning-filtered';
    link_inner = '<span></span> ' + code;
  } else {
    cls = 'pu-sample-link warning';
    ctrl = false;
    link_inner = '<span><i class="iconic iconic-warning-triangle"></i></span> ' + code;
  }
  link.setAttribute('id', id);
  link.setAttribute('data-code', code);
  link.setAttribute('data-color', color);
  link.setAttribute('class', cls);
  link.innerHTML = link_inner;
  link.addEventListener('click', (e) => {
    gtiz_map.sampleSelection(link, code, ctrl);
  });

  return link;
}

gtiz_map.defineMarkers = () => {
  let tree = gtiz_tree.tree;
  let filtered_nodes = gtiz_tree.filtered_nodes;
  let metadata = tree.metadata;
  let colors = tree.category_colours;
  let category = tree.display_category;
  let all_nodes = tree.node_map ? Object.keys(tree.node_map) : tree.getAllNodesIDs();
  let nodes;
  if (filtered_nodes && filtered_nodes.length > 0) {
    nodes = filtered_nodes;
  } else {
    nodes = all_nodes;
  }
  this.pointLayer.eachLayer((layer) => {
    let icon = layer._icon;
    let div = document.createElement('div');
    div.setAttribute('class', 'pie-chart');
    let samples = layer.feature.properties.samples;
    let point_data = {};
    let point_colors = [];
    let point_colors_reduced = [];
    let samples_with_colors = [];
    let dictionary = {};
    let samples_links = [];
    // retrieve information about sample codes and colors
    samples.forEach((sample, index) => {
      let code = sample.codice;
      let color = '#ffffff';
      if (nodes.includes(code)) {
        if (metadata[code]) {
          let key_color = metadata[code][category];
          color = colors[key_color] ? colors[key_color] : '#ffffff';
        }
        let obj = {
          sample : code,
          color : color
        };
        samples_with_colors.push(obj);
        gtiz_map.samples_colors_index.push(obj);
        point_colors.push(color);
      }
      
      // set also a list of sample links to use in the popup
      let sample_link = gtiz_map.getPopUpSampleLink(all_nodes, nodes, code, color);
      samples_links.push(sample_link);
    });

    let popup = gtiz_map.getPopUp(samples_links);

    layer.bindPopup(popup).on('click', function(e) {
      let contents = e.target._popup._container.querySelector('.point-popup-contents');
      let s_nodes = tree.getAllSelectedNodesIDs();
      let a = contents.querySelectorAll('a.pu-sample-link');
      let ul = contents.querySelector('ul');
      let selected_info = ul.querySelector(".point-popup-info-selected");
      let warning_info = ul.querySelector('.point-popup-info-warning');
      // translate contents
      gtiz_locales.translate(contents);
      /**
       * We need to detect which of the single sample are selected when pupup is binded, the bind action seems to build popup in that specific moment. So we need to control if samples contained in the popup corresponds to the samples selected on the tree. If yes we assing a `p-selected` class wich defines the ui. In the same for loop we count how many selected samples is in there and also mismatching sample marked with `warning` class in popup construction to give some information and utilities to the users.
       * 
       */
      a.forEach(el => {
        let pu_a_code = el.getAttribute('data-code');
        if (s_nodes.includes(pu_a_code)) {
          el.classList.add('p-selected');
        }
      });
      /**
       * Here we add information about samples and utilities to work with them.
       * 
       */
      let selected = contents.querySelectorAll('.p-selected').length;
      let warnings = contents.querySelectorAll('.warning').length;
      if (selected && selected > 0) {
        let text = 
        selected_info.innerHTML = gtiz_locales.current.selected_samples + ' <span class="info-number">' + selected + '</span>';
      } else {
        selected_info.innerHTML = gtiz_locales.current.no_sample_selected + '  <span class="info-number"></span>';
      }
      if (warnings && warnings > 0) {
        if (!warning_info) {
          warning_info = document.createElement("li");
          warning_info.setAttribute('class', 'point-popup-info-warning');
          ul.appendChild(warning_info);
        }
        warning_info.innerHTML = 'Samples not in GrapeTree <span class="info-number">' + warnings + '</span>';
      }
      /**
       * Center and zoom on point clicked
       * 
       */
      let lat = e.latlng.lat;
      let lng = e.latlng.lng;
      let lat_lng = [];
      lat_lng.push(lat, lng);
      map.setView(lat_lng);
    });

    let samples_number = samples.length;
    let point_radius = gtiz_map.calculatePointRadius(samples_number);

    // Set the dimensions and margins of the graph
    let width = point_radius * 2;
    let height = point_radius * 2;
    let margin = 10;

    // The radius of the pie plot is half the width or half the height (smallest one). Subtract a bit of margin.
    let radius = Math.min(width, height) / 2 - margin;

    // Append the SVG object to the div called 'my_dataviz'
    let svg = d3.select(div)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Reduce the number of path by joining similar colors giving the value of a sum of them
    point_colors.forEach((color, index) => {
      if (!dictionary[color]) {
        dictionary[color] = [];
      }
      dictionary[color].push(index);
    });

    samples_with_colors.forEach(item => {
      let color = item.color;
      let sample = item.sample;
      if (!point_colors_reduced.includes(color)) {
        point_colors_reduced.push(color);
        let occurrencies = dictionary[color].length;
        point_data[sample] = occurrencies;
      }
    });

    // Create data
    let data = point_data;

    // Set the color scale
    let color = d3.scale.ordinal()
    .domain(Object.keys(data))
    .range(point_colors_reduced);

    // Compute the position of each group on the pie
    let pie = d3.layout.pie()
    .value(function(d) { return d.value; });

    let data_ready = pie(d3.entries(data));

    // Build the pie chart: Each part of the pie is a path built using the arc function
    svg.selectAll('whatever')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', d3.svg.arc()
      .innerRadius(0)
      .outerRadius(radius))
    .attr('fill', function(d) { return color(d.data.key); })
    // .attr("stroke", "black")
    // .style("stroke-width", "2px")
    .style("opacity", 0.7);

    if (gtiz_map.markers_type == 'heatmap') {
      let paths = svg.selectAll("path");
      paths.style("opacity", 0.8).style("filter", "blur(20px)");
    }

    // Update the icon width for the current marker layer
    let icon_options = layer.options.icon.options;
    icon_options.iconSize = [width, height];
    icon_options.iconAnchor = [width/2, height/2];
    icon_options.html = div;
    icon_options.popupAnchor = [0, -height/2];
    // Update the icon for the current marker layer
    layer.setIcon(L.divIcon(icon_options));
  });
}

gtiz_map.reBuildGeoJSON = () => {
  
  let data = JSON.parse(gtiz_map.geojson);
  let type = gtiz_map.delta_type;
  let delta = gtiz_map.delta;
  let nodes_in_map = gtiz_tree.tree.node_map ? Object.keys(gtiz_tree.tree.node_map) : undefined;
  if (nodes_in_map) {
    if (Object.keys(data.features).length > nodes_in_map.length) {
      data.features = data.features.filter(feature => {
        return nodes_in_map.includes(feature.properties.codice);
      });
    }
  }
  /**
   * 
   * We need to rebuild the GeoJSON provided as an url parameter to merge samples codes with same coordinates, first of all this will avoid the marker overlap but also get the basis to make (and color) pie chart when multiple samples are present in the same point.
   * 
   * When rebuilding the GeoJSON we hold a point clustering system in order to allow users to aggregate point in two ways: with a simple numeric delta (this will reduce geographical nearest points) or with metadata (this will aggregate point by samples properties). We apply the given delta (numeric or string) on coordinates before rebuild a new object.
   * 
   * In some circustances we have also to filter by an array of nodes to match the code inside JSON, this is the role of the third argument of the function, the filter should be an array of samples.
   * 
   */

  let r_obj = {
    "features": [],
    "name": data.name,
    "type": data.type,
    "id_dashboard": data.id_dashboard
  };
/*   let d_coordinates;
  let d_data = [];
  let d_code = []; */
  let ctrl = [];
  let clusters = {};

  // check if delta type is geographical (then it comes from aggregation select box) or metadata (then it comes from metedata select box), to be improved after test
  if (type == "geographical") {
    /**
     * First of all we build an object containing cooridnates cluster grouped by a key given with the "reduced" lat and lng. We create also a new parameter to data object `data.features[i].properties.kstr` with same value of the cluster[key], this will allow us to make a match between objects later in the code.
     * 
     * 
     */
    data.features.forEach(feature => {
      let key = '';
      let base = gtiz_map.clustering_base; // changing the base value will change also the sensibility of the delta
      let node = feature.geometry.coordinates;
      let lng = 0;
      let lat = 0;
      lng = parseInt(node[0] * Math.pow(base, delta)) / Math.pow(base, delta);
      lat = parseInt(node[1] * Math.pow(base, delta)) / Math.pow(base, delta);
      key = lng + "-" + lat;
      feature.properties.kstr = key;
      if (clusters[key] == undefined) {
        clusters[key] = [];
      }
      clusters[key].push(node);
    });
    /**
     * Then we loop clusters object to make the average of lat and lng grouped for each key, the results will be used to place the cluster in the map by giving it as coordinates to the `data.features[i].geometry.coordinates`.
     * 
     * 
     */
    Object.keys(clusters).forEach(key => {
      let initial_value = 0;
      let lng_sum = clusters[key].reduce(
        (previous_value, current_value) => {
          return previous_value + current_value[0];
        },
        initial_value
      );
      let lat_sum = clusters[key].reduce(
        (previous_value, current_value) => {
          return previous_value + current_value[1];
        },
        initial_value
      );
      let lng_average = lng_sum / clusters[key].length;
      let lat_average = lat_sum / clusters[key].length;
      data.features.forEach(feature => {
        if (feature.properties.kstr == key) {
          feature.geometry.coordinates[0] = lng_average;
          feature.geometry.coordinates[1] = lat_average;
        }
      });
    });
  } else {
    /**
     * If the delta is a metadata we will build an object containing cooridnates cluster grouped by a key given by the delta value string get from tree metadata. We create also a new parameter to data object `data.features[i].properties.kstr` with same value of the cluster[key], this will allow us to make a match between objects later in the code.
     * 
     * 
     */
    let md = gtiz_tree.tree.getMetadata();
    data.features.forEach(feature => {
      let key = '';
      let sample = feature.properties.codice;
      let node = feature.geometry.coordinates;
      if (md[sample]) {
        if (md[sample][delta]) {
          key = md[sample][delta];
          feature.properties.kstr = key;
          if (clusters[key] == undefined) {
            clusters[key] = [];
          }
          clusters[key].push(node);
        }
      }
    });
    /**
     * Then in the same way we did for delta number, we loop clusters object to make the average of lat and lng grouped for each key, the results will be used to place the cluster in the map by giving it as coordinates to the `data.features[i].geometry.coordinates`.
     * 
     * TO BE IMPROVED, CREATE AN UNIQUE FUNCTION TO REDUCE CLUSTERS
     * 
     */
    Object.keys(clusters).forEach(key => {
      let initial_value = 0;
      let lng_sum = clusters[key].reduce(
        (previous_value, current_value) => {
          return previous_value + current_value[0];
        },
        initial_value
      );
      let lat_sum = clusters[key].reduce(
        (previous_value, current_value) => {
          return previous_value + current_value[1];
        },
        initial_value
      );
      let lng_average = lng_sum / clusters[key].length;
      let lat_average = lat_sum / clusters[key].length;
      data.features.forEach(feature => {
        if (feature.properties.kstr == key) {
          feature.geometry.coordinates[0] = lng_average;
          feature.geometry.coordinates[1] = lat_average;
        }
      });
    });
  }

  /**
   * Finally we build the new GeoJSON starting from `data` object to merge samples codes with same coordinates
   * 
   * 
   */
  data.features.forEach(feature => {
    let code = feature.properties.codice;
    /**
     * We retrieve all the coordinates, convert them in string and push in a controller array. If a coordinate do not exists in this array we build a new object and push it into new geoJSON (r_obj) if it already exists we do not build a new object to push but we will push directly data and codes in the existing object.
     * 
     * 
     */
    let d_str = JSON.stringify(feature.geometry.coordinates);
    // d_str is used to build an array to control duplicates and to give an id to the object
    // we will use the id later to retreive the existing object and push samples
    if (!ctrl.includes(d_str)) {
      ctrl.push(d_str);
      let obj = {
        "geometry": {
          "coordinates": [],
          "type": "Point",
        },
        "type": "Feature",
        "properties": {
          "samples": []
        }
      };
      obj.geometry.coordinates = feature.geometry.coordinates;
      // obj.kstr = key;
      obj.kstr = feature.properties.kstr;
      obj.id = d_str;
      let sample = {
        "data": feature.properties.data,
        "codice": feature.properties.codice
      };
      obj.properties.samples.push(sample);
      r_obj.features.push(obj);
    } else {
      // here we use id to get the existing object and push samples that share same coordinates
      let foundIndex = r_obj.features.findIndex(x => x.id == d_str);
      let sample = {
        "data": feature.properties.data,
        "codice": feature.properties.codice
      };
      r_obj.features[foundIndex].properties.samples.push(sample);
    }
  });
  this.pointLayer.addData(r_obj);

} // reBuildGeoJSON

/**
 * 
 * Define point layers
 * 
 * Arguments: delta and type are mandatory.
 * 
 */
gtiz_map.definePoints = () => {

  /**
   * If point layer exists clear layers.
   * 
   */
  let point_layer = this.pointLayer;
  if (point_layer) {
    point_layer.clearLayers();
  }
  
  /**
   * If samples amount is defined, clear it.
   * 
   */
  if (gtiz_map.samples_amount && gtiz_map.samples_amount.length > 0) {
    gtiz_map.samples_amount = [];
  }
  
  let icon = L.divIcon({
    className: 'pie-marker-icon',
    // html: '<div class="pie-chart">...</div>',
  });
  
  /**
   * 
   * Empty layer to host points
   * 
   */
  this.pointLayer = L.geoJSON(null, {
    pointToLayer: (feature, latlng) => {
      return L.marker(latlng, {
        icon
      });
    },
    onEachFeature: (feature, layer) => {
      let samples = layer.feature.properties.samples;
      gtiz_map.samples_amount.push(samples.length);
    }
  }).addTo(this.map);

} // definePoints

/**
 * 
 * ## Selections Tree -> Map
 * 
 * Selected ids and passed to this function from gtiz_tree.tree_interceptor are used to filter features (points) array of the map layer and populate the empty layer for the selection
 * 
 */
gtiz_map.findNodesInMap = (selected_groups) => {
  if (this.pointLayer && gtiz_map.initialized) {
    let selected_ids = [];

    this.pointLayer.eachLayer((layer) => {
      layer._icon.classList.remove('selected');
      layer._icon.classList.remove('fully-selected');
      layer._icon.classList.remove('partially-selected');
    });

    if (selected_groups !== 'unselect_all') {
      selected_ids = Object.values(selected_groups).flat();
      if (selected_ids.length > 0) {
        this.pointLayer.eachLayer((layer) => {
          let feat_samples = layer.feature.properties.samples;
          let feat_samples_codes = [];
          for (let i = 0; i < feat_samples.length; i++) {
            feat_samples_codes.push(feat_samples[i].codice);
          }
          let contains_all = feat_samples_codes.every(element => {
            return selected_ids.includes(element);
          });
          let contains_some = feat_samples_codes.some(element => {
            return selected_ids.includes(element);
          });

          if (contains_all) {
            // layer._icon is the canvas containing the pie chart
            layer._icon.classList.add('selected');
            layer._icon.classList.add('fully-selected');
          } else {
            if (contains_some) {
              // layer._icon is the canvas containing the pie chart
              layer._icon.classList.add('selected');
              layer._icon.classList.add('partially-selected');
            }
          }
        });
      } else {
        this.pointLayer.eachLayer((layer) => {
          layer._icon.classList.remove('selected');
          layer._icon.classList.remove('fully-selected');
          layer._icon.classList.remove('partially-selected');
        });
      }
    }

    if (selected_groups == 'unselect_all') {
      this.pointLayer.eachLayer((layer) => {
        layer._icon.classList.remove('selected');
        layer._icon.classList.remove('fully-selected');
        layer._icon.classList.remove('partially-selected');
      });
    }

    if (selected_groups == 'select_all') {
      this.pointLayer.eachLayer((layer) => {
        layer._icon.classList.remove('selected');
        layer._icon.classList.remove('fully-selected');
        layer._icon.classList.remove('partially-selected');
      });
    }
  }
} // findNodesInMap

/**
 * 
 * Update style for nodes in map.
 * 
 */
gtiz_map.updateNodesInMap = () => {

  let selection_mode = gtiz_legend.selection_mode;
  if (selection_mode == 'visual') {
    let colors = [];
    let items = document.querySelectorAll('.card-legend .list-row');
    items.forEach(item => {
      if (item.classList.contains('selected')) {
        let color = item.getAttribute('data-group-colour-izsam');
        colors.push(color);
      }
    });
    gtiz_map.alterMarkers(colors);
  } else {
    let grouped_nodes_obj = {};
    let selected_nodes = gtiz_tree.tree.getSelectedNodeIDs();
    let selected_ids = [];
    for (let selected_node of selected_nodes) {
      grouped_nodes_obj[selected_node] = gtiz_tree.tree.grouped_nodes[selected_node];
    }
    for (let [key, value] of Object.entries(grouped_nodes_obj)) {
      // console.log(key, value);
      selected_ids.push(...value);
    }

    this.pointLayer.eachLayer((layer) => {
      layer._icon.classList.remove('selected');
      layer._icon.classList.remove('fully-selected');
      layer._icon.classList.remove('partially-selected');
    });

    if (selected_ids.length > 0) {
      this.pointLayer.eachLayer((layer) => {
        let feat_samples = layer.feature.properties.samples;
        let feat_samples_codes = [];
        for (let i = 0; i < feat_samples.length; i++) {
          feat_samples_codes.push(feat_samples[i].codice);
        }
        let contains_all = feat_samples_codes.every(element => {
          return selected_ids.includes(element);
        });
        let contains_some = feat_samples_codes.some(element => {
          return selected_ids.includes(element);
        });

        if (contains_all) {
          // layer._icon is the canvas containing the pie chart
          layer._icon.classList.add('selected');
          layer._icon.classList.add('fully-selected');
        } else {
          if (contains_some) {
            // layer._icon is the canvas containing the pie chart
            layer._icon.classList.add('selected');
            layer._icon.classList.add('partially-selected');
          }
        }
      });
    } else {
      this.pointLayer.eachLayer((layer) => {
        layer._icon.classList.remove('selected');
        layer._icon.classList.remove('fully-selected');
        layer._icon.classList.remove('partially-selected');
      });
    }
  }
} // updateNodesInMap

/**
 * Card context menu definition
 * 
 */
gtiz_map.context_menu = [{
  type : 'toggle',
  id : 'map-aggregation-toggle',
  options : [{
      label : gtiz_locales.current.join_by_coordinates,
      value : 'geographical',
      icon : 'iconic-pin'
    }, {
      label : gtiz_locales.current.join_by_metadata,
      value : 'metadata',
      icon : 'iconic-file-text'
  }],
  selected : () => {
    return  gtiz_map.default_delta_type;
  },
  function : (value) => {
    gtiz_map.toggleAggregationMode(value);
  }
}, {
  type : 'select',
  id : 'map-delta-select',
  label : gtiz_locales.current.set_value,
  icon : '',
  options : () => {
    let values = gtiz_map.getMapDeltaSelectOptions();
    return values;
  },
  default : undefined,
  get_default : () => {
    let value = gtiz_map.getMapDeltaSelectDefault();
    return value;
  },
  function : (value) => {
    gtiz_map.setMapDelta(value);
  }
}, {
  type : 'button',
  id : 'map-reset-delta',
  label : gtiz_locales.current.reset_default,
  icon : 'iconic-refresh',
  function : () => {
    gtiz_map.resetMapDelta();
  }
}, {
  type : 'separator'
}, {
  type : 'number',
  id : 'map-point-min-radius',
  label : gtiz_locales.current.min_marker_radius,
  icon : '',
  min: 0,
  max: undefined,
  default : undefined,
  get_default : () => {
    let value = gtiz_map.getMinMarkerValues();
    return value;
  },
  function : (value) => {
    gtiz_map.setMinMarkerValue(value);
  }
}, {
  type : 'number',
  id : 'map-point-max-radius',
  label : gtiz_locales.current.max_marker_radius,
  icon : '',
  min: 0,
  max: undefined,
  default : undefined,
  get_default : () => {
    let value = gtiz_map.getMaxMarkerValues();
    return value;
  },
  function : (value) => {
    gtiz_map.setMaxMarkerValue(value);
  }
}, /* {
  type : 'button',
  id : 'set-map-point-delta-radius',
  label : gtiz_locales.current.set_radius,
  icon : 'iconic-target',
  function : ''
}, */ {
  type : 'button',
  id : 'map-reset-max-min-radius',
  label : gtiz_locales.current.reset_default,
  icon : 'iconic-refresh',
  function : () => {
    gtiz_map.resetMinMaxMarkerValues();
  }
}, {
  type : 'separator'
}, {
  type : 'toggle',
  id : 'map-marker-mode-toggle',
  options : [{
      label : gtiz_locales.current.pie_chart_mode,
      value : 'piechart',
      icon : 'iconic-pie-chart'
    }, {
      label : gtiz_locales.current.heat_map_mode,
      value : 'heatmap',
      icon : 'iconic-sun'
  }],
  selected : () => {
    return  gtiz_map.markers_type;
  },
  function : (value) => {
    gtiz_map.toggleMarkerType(value);
  }
}];

gtiz_map.init = function() {
  
  gtiz_map.map_container.classList.remove('map-initialized');
  gtiz_map.map_container.classList.remove('map-not-initialized');
  gtiz_loader.addLoader(gtiz_map.map_container);

  setTimeout(() => {
    if (!gtiz_map.geojson || gtiz_map.geojson == '') {
      // here we give priority to geo file loaded as url instead of coordinates loaded in metadata
      if ('geo' in gtiz_file_handler.params) {
        // uncomment following code to open map component automatically
        // if (!gtiz_map.initialized) { gtiz_map.openMapComponent(); }
        let geo = gtiz_file_handler.params.geo;
        gtiz_file_handler.getData(geo).then((obj) => {
          if (obj.error) {
            let title = '<i class="iconic iconic-warning-triangle"></i> ' + gtiz_locales.current.oops;
            let html = gtiz_locales.current.missing_net_geo_alert;
            if (obj.status) {
              if (obj.status == 403) {
                title = '<i class="iconic iconic-warning-triangle"></i> ' + gtiz_locales.current.oops_forbidden_http;
                let protocol = window.location.protocol;
                let hostname = window.location.host;
                let url = protocol + '//' + hostname;
                html = gtiz_locales.current.forbidden_net_geojson_alert.replace('{0}', url).replace('{1}', url);
              }
              if (obj.status == 404) {
                title = '<i class="iconic iconic-warning-triangle"></i> ' + gtiz_locales.current.oops_not_found_http;
                html = gtiz_locales.current.not_found_net_geojson_alert;
              }
            }
            let contents = [];
            let content = document.createElement('p');
            content.innerHTML = html;
            contents.push(content);
            let feedback = '<p>' + obj.text + '</p>';
            let f_type = 'info';
            gtiz_modal.buildNotifier(title, contents, feedback, f_type);
            let map_node = document.querySelector('#map-div');
            map_node.classList.add('map-not-initialized');
            gtiz_loader.removeLoader(map_node);
          } else {
            gtiz_map.setGeoJSON(obj.text);
            if (!gtiz_map.initialized) {
              gtiz_map.initMap();
            }
            gtiz_map.definePoints();
            gtiz_map.reBuildGeoJSON();
            gtiz_map.defineMarkers();
            gtiz_map.updateNodesInMap();
            if (gtiz_map.map_container.classList.contains('map-not-initialized')) {
              gtiz_map.map_container.classList.remove('map-not-initialized');
            } 
            gtiz_loader.removeLoader(gtiz_map.map_container);
            gtiz_map.map_container.classList.add('map-initialized');
            gtiz_map.load_count++;
            if (gtiz_map.load_count == 1) {
              // fitBounds force the map to zoom and allow the view of all the point, padding add a space around
              map.fitBounds(pointLayer.getBounds(), {
                padding: [21, 21]
              });
            }
            gtiz_tree.updateOriginalTree('map');
          }
        }).catch((err) => {
          console.log(err);
          let title = '<i class="iconic iconic-warning-triangle"></i> ' + gtiz_locales.current.oops;
          let contents = [];
          let content = document.createElement('p');
          content.innerHTML = gtiz_locales.geojson_file_generic_problem;
          contents.push(content);
          let feedback = '<p>' + err + '</p>';
          let f_type = 'info';
          gtiz_modal.buildNotifier(title, contents, feedback, f_type);
        });
        
      } else {
        if (gtiz_map.geojson_from_metadata && gtiz_map.geojson_from_metadata != '') {
          let geoJ = gtiz_map.geojson_from_metadata;
          gtiz_map.setGeoJSON(geoJ);
          if (!gtiz_map.initialized) {
            // uncomment following code to open map component automatically
            // gtiz_map.openMapComponent();
            gtiz_map.initMap();
          }
          gtiz_map.definePoints();
          gtiz_map.reBuildGeoJSON();
          gtiz_map.defineMarkers();
          gtiz_map.updateNodesInMap();
          if (gtiz_map.map_container.classList.contains('map-not-initialized')) {
            gtiz_map.map_container.classList.remove('map-not-initialized');
          } 
          gtiz_loader.removeLoader(gtiz_map.map_container);
          gtiz_map.map_container.classList.add('map-initialized');
          gtiz_map.load_count++;
          if (gtiz_map.load_count == 1) {
            // fitBounds force the map to zoom and allow the view of all the point, padding add a space around
            map.fitBounds(pointLayer.getBounds(), {
              padding: [21, 21]
            });
          }
          gtiz_tree.updateOriginalTree('map');
        } else {
          let map_node = document.querySelector('#map-div');
          map_node.classList.add('map-not-initialized');
          gtiz_loader.removeLoader(map_node);
        }
      }
    } else {
      if (!gtiz_map.initialized) {
        // uncomment following code to open map component automatically
        // gtiz_map.openMapComponent();
        gtiz_map.initMap();
      }
      gtiz_map.definePoints();
      gtiz_map.reBuildGeoJSON();
      gtiz_map.defineMarkers();
      gtiz_map.updateNodesInMap();
      if (gtiz_map.map_container.classList.contains('map-not-initialized')) {
        gtiz_map.map_container.classList.remove('map-not-initialized');
      } 
      gtiz_loader.removeLoader(gtiz_map.map_container);
      gtiz_map.map_container.classList.add('map-initialized');
      gtiz_map.load_count++;
      if (gtiz_map.load_count == 1) {
        // fitBounds force the map to zoom and allow the view of all the point, padding add a space around
        map.fitBounds(pointLayer.getBounds(), {
          padding: [21, 21]
        });
      }
      gtiz_tree.updateOriginalTree('map');
    }
  }, 500);

}