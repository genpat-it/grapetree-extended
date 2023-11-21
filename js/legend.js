let gtiz_legend = {};

gtiz_legend.selection_mode = 'qualitative'; // `qualitative` || `visual`
gtiz_legend.view_mode = 'list'; // `list` || `histogram`
gtiz_legend.group_order = {
  type : 'size',
  sort : 'desc'
};
gtiz_legend.selection_map = undefined;

gtiz_legend.context_menu = [{
  type : 'toggle',
  id : 'legend-menu-selection-mode',
  options : [{
      label : () => {
        return gtiz_locales.current.related_nodes_selection;
      },
      value : 'qualitative',
      icon : 'iconic-information'
    },
    {
      label : () => {
        return gtiz_locales.current.visual_selection;
      },
      value : 'visual',
      icon : 'iconic-sun'
  }],
  selected : () => {
    return  gtiz_legend.selection_mode;
  },
  function : (value) => {
    gtiz_legend.toggleSelectionMode(value);
  }
}, {
  type : 'separator'
}, {
  type : 'button',
  id : 'legend-menu-select-all',
  label : () => {
    return gtiz_locales.current.select_all_items;
  },
  icon : 'iconic-check-circle',
  function : () => {
    gtiz_legend.selectAll();
  }
}, {
  type : 'button',
  id : 'legend-menu-invert-selection',
  label : () => {
    return gtiz_locales.current.invert_selection;
  },
  icon : 'iconic-sticker',
  function : () => {
    gtiz_legend.invertSelection();
  }
}, {
  type : 'button',
  id : 'legend-menu-clean-selection',
  label : () => {
    return gtiz_locales.current.clean_selection;
  },
  icon : 'iconic-minus-circle',
  function : () => {
    gtiz_legend.unselectAll();
  }
}, {
  type : 'separator'
}, {
  type : 'select',
  id : 'legend-menu-color-by',
  label : () => {
    return gtiz_locales.current.color_by;
  },
  icon : '',
  options : () => {
    let values = gtiz_legend.getColorByOptions();
    return values;
  },
  default : undefined,
  get_default : () => {
    let value = gtiz_legend.getColorByDefaultValue();
    return value;
  },
  function : (value) => {
    gtiz_legend.changeCategoryColor(value);
  }
}, {
  type : 'number',
  id : 'legend-menu-maximum-group-number',
  label : () => {
    return gtiz_locales.current.maximum_group_number;
  },
  icon : '',
  min: 0,
  max: 100000, // value from original GrapeTree context.js
  default : undefined,
  get_default : () => {
    let value = gtiz_legend.getMaxGroupNumberValue();
    return value;
  },
  function : (value) => {
    gtiz_legend.changeMaxGroupNumber(value);
  }
}, {
  type : 'number',
  id : 'legend-menu-minimum-group-size',
  label : () => {
    return gtiz_locales.current.minimum_group_size;
  },
  icon : '',
  min: 0,
  max: 100000, // value from original GrapeTree context.js
  default : undefined,
  get_default : () => {
    let value = gtiz_legend.getMinGroupSizeValue();
    return value;
  },
  function : (value) => {
    gtiz_legend.changeMinGroupSize(value);
  }
}, {
  type : 'separator'
}, {
  type : 'select',
  id : 'legend-menu-data-category',
  label : () => {
    return gtiz_locales.current.data_category;
  },
  icon : '',
  options : [{
    label : () => {
      return gtiz_locales.current.character;
    },
    value : 'character'
  }, {
    label : () => {
      return gtiz_locales.current.numeric;
    },
    value : 'numeric'
  }],
  default : undefined,
  get_default : () => {
    let value = gtiz_legend.getDataCategory();
    return value;
  },
  function : (value) => {
    gtiz_legend.changeDataCategory(value);
  }
}, {
  type : 'select',
  id : 'legend-menu-group-order',
  label : () => {
    return gtiz_locales.current.group_order;
  },
  icon : '',
  options : [{
    label : () => {
      return gtiz_locales.current.size_desc;
    },
    value : 'size-desc'
  }, {
    label : () => {
      return gtiz_locales.current.size_asc;
    },
    value : 'size-asc'
  }, {
    label : () => {
      return gtiz_locales.current.label_asc;
    },
    value : 'alphabetic-asc'
  }, {
    label : () => {
      return gtiz_locales.current.label_desc;
    },
    value : 'alphabetic-desc'
  }],
  default : undefined,
  get_default : () => {
    let value = gtiz_legend.getGroupOrder();
    return value;
  },
  function : (value) => {
    gtiz_legend.changeGroupOrder(value);
  }
}, , {
  type : 'select',
  id : 'legend-menu-color-scheme',
  label : () => {
    return gtiz_locales.current.color_scheme;
  },
  icon : '',
  options : [{
    label : () => {
      return gtiz_locales.current.category;
    },
    value : 'category'
  }, {
    label : () => {
      return gtiz_locales.current.gradient;
    },
    value : 'gradient'
  }, {
    label : () => {
      return gtiz_locales.current.gradient_cool;
    },
    value : 'gradient_cool'
  }, {
    label : () => {
      return gtiz_locales.current.gradient_rainbow;
    },
    value : 'gradient_rainbow'
  }, {
    label : () => {
      return gtiz_locales.current.gradient_rainbow2;
    },
    value : 'gradient_rainbow2'
  }, {
    label : () => {
      return gtiz_locales.current.gradient_rainbow3;
    },
    value : 'gradient_rainbow3'
  }, /* {
    label : gtiz_locales.current.custom,
    value : 'custom'
  } */],
  default : undefined,
  get_default : () => {
    let value = gtiz_legend.getColorScheme();
    return value;
  },
  function : (value) => {
    gtiz_legend.changeColorScheme(value);
  }
}, {
  type : 'separator'
}, {
  type : 'toggle',
  id : 'legend-menu-view-mode',
  options : [{
      label : () => {
        return gtiz_locales.current.list_view;
      },
      value : 'list',
      icon : 'iconic-legend'
    },
    {
      label : () => {
        return gtiz_locales.current.histogram_view;
      },
      value : 'histogram',
      icon : 'iconic-chart'
  }],
  selected : () => {
    return  gtiz_legend.view_mode;
  },
  function : (value) => {
    gtiz_legend.toggleViewMode(value);
  }
}, {
  type : 'button',
  id : 'legend-menu-quick-gradient',
  label : () => {
    return gtiz_locales.current.quick_gradient;
  },
  icon : 'iconic-clock',
  function : () => {
    gtiz_legend.quickGradient();
  }
}];

/**
 * Initialize spectrum library (to be converted in vanilla javascript)
 * 
 */
gtiz_legend.legend_colour_chooser = $("<input>").spectrum({
  //type: "flat",
  togglePaletteOnly: "true",
  showInput: "true",
  showInitial: "true",
  allowEmpty: "false",
  showAlpha: "false",
  change: function(e) {
    var cc = $(this);
    gtiz_tree.tree.setColour(cc.data("category"),cc.data("value"),cc.val());
    gtiz_tree.tree.changeCategory(cc.data("category"));
    if (gtiz_legend.selection_mode == 'visual') {
      gtiz_legend.resetVisualSelection();
      gtiz_legend.highlightSelection();
    } else {
      gtiz_legend.resetQualitativeSelection();
    }
  }}).hide();

/**
 * Change appaerance and class for the selcted legend item
 * 
 * @param {Node} item DOM node for the legend item
 */
gtiz_legend.toggleItemSelection = function(obj, tree) {
  let selection_mode = gtiz_legend.selection_mode;
  let item = obj.current_target;
  let check = item.querySelector('.list-check');
  let icon = check.querySelector('i');
  item.classList.toggle('selected');
  if (item.classList.contains('selected')) {
    icon.setAttribute('class', 'iconic iconic-check-circle');
  } else {
    icon.setAttribute('class', 'iconic iconic-check-circle-empty');
  }
  if (selection_mode == 'qualitative') {
    gtiz_legend.nodeSelection(obj, tree);
  } else {
    gtiz_legend.highlightSelection(obj, tree);
  }
};

gtiz_legend.setContextMenuForm = function(tree) {
  gtiz_legend.context_menu.forEach(item => {
    if (item.id) {
      let id = '#' + item.id;
      let input = document.querySelector(id);
      if (input) {
        if (item.default) {
          let value = item.default;
          input.value = value;
        } else {
          if (typeof item.get_default === 'function') {
            let value = item.get_default();
            input.value = value;
          }
        }
      }
    } 
  });
}

/**
 * Change color by category
 * 
 * @param {String} value Category
 */
gtiz_legend.changeCategoryColor = function(value) {
  let tree = gtiz_tree.tree;
  let color = value;
	tree.changeCategory(color);
  gtiz_legend.setContextMenuForm(tree);
  if (gtiz_legend.selection_mode == 'visual') {
    gtiz_legend.resetVisualSelection();
    gtiz_legend.highlightSelection();
  } else {
    gtiz_legend.resetQualitativeSelection();
  }
  // gtiz_layout.setLegendHeight(300);
}

/**
 * Get current active category to set color by form value in context menu
 * 
 * @returns category
 */
gtiz_legend.getColorByDefaultValue = function() {
  let tree = gtiz_tree.tree;
  let category = tree.display_category;
  return category;
}

/**
 * Retreive the metadata category list to populate relative legend context menu select input.
 * 
 * @returns colors An array of object with value and label of available catgories
 */
gtiz_legend.getColorByOptions = function() {
  let tree = gtiz_tree.tree;
  let colors = Object.keys(tree.metadata_info)
  .sort()
  .map(function(category) {
    let label = tree.metadata_info[category]['label'];
    label = label.toLowerCase();
    label = label.charAt(0).toUpperCase() + label.slice(1) // same formula used to render legend title
    let ar = {
      value : category,
      label : label
    }
    return ar;
  });
  return colors;
}

/**
 * Get the current number of categories (items) to see in legend
 * 
 * @returns Number
 */
gtiz_legend.getMaxGroupNumberValue = function() {
  let tree = gtiz_tree.tree;
  let category = tree.display_category;
  let info = tree.metadata_info[category];
  let value = info.category_num;
  
  return value;
}

/**
 * Change max number of groups (categories, items) in legend list (category_num)
 * 
 * @param {String} value Value from input
 */
gtiz_legend.changeMaxGroupNumber = function(value) {
  let tree = gtiz_tree.tree;
  let category = tree.display_category;
  let number = parseInt(value);
	let category_info = tree.metadata_info[category];
  if (number !== category_info.category_num) {
		category_info.category_num = number;
		tree.changeCategory(category);
    // gtiz_layout.setLegendHeight(300);
	}
}

/**
 * Get the current minimum number of items in group to see in legend (minnum)
 * 
 * @returns Number
 */
gtiz_legend.getMinGroupSizeValue = function() {
  let tree = gtiz_tree.tree;
  let category = tree.display_category;
  let info = tree.metadata_info[category];
  let value = info.minnum;

  return value;
}

/**
 * Change max number of groups (categories, items) in legend list
 * 
 * @param {String} value Value from input
 */
gtiz_legend.changeMinGroupSize = function(value) {
  let tree = gtiz_tree.tree;
  let category = tree.display_category;
  let number = parseInt(value);
	let category_info = tree.metadata_info[category];
  if (number !== category_info.minnum) {
		category_info.minnum = number;
		tree.changeCategory(category);
    // gtiz_layout.setLegendHeight(300);
	}
}

/**
 * Get the current data category (coltype)
 * 
 * @returns String
 */
gtiz_legend.getDataCategory = function() {
  let tree = gtiz_tree.tree;
  let category = tree.display_category;
  let info = tree.metadata_info[category];
  let value = info.coltype;
  
  return value;
}

/**
 * Change data category (coltype).
 * 
 * @param {String} value `'character'` || `'numeric'`
 *  
 */
gtiz_legend.changeDataCategory = function(value) {
  let tree = gtiz_tree.tree;
  let category = tree.display_category;
  let category_info = tree.metadata_info[category];
  if (value !== category_info.coltype) {
    category_info.coltype = value;
    tree.changeCategory(category);
  }
}

/**
 * Get the current group order (grouptype).
 * 
 * @returns String
 */
gtiz_legend.getGroupOrder = function() {
  let tree = gtiz_tree.tree;
  let category = tree.display_category;
  let info = tree.metadata_info[category];
  let value = info.grouptype;
  if (value == 'size') {
    value = 'size-desc';
  } else {
    value = 'alphabetic-asc';
  }
  return value;
}

/**
 * Change group order (grouptype). Natively grapetree allow to use only size descendant or alphabetic ascendant,  we extend this by using `-asc` and `-desc` and saving the choice in the gtiz_legend object in order to invert order in `base_tree.js`.
 * 
 * @param {String} value `'size-asc'` || `'size-desc'` || `'alphabetic-asc'` || `'alphabetic-desc'`
 *  
 */
gtiz_legend.changeGroupOrder = function(value) {
  let delimiter = '-';
  let index = value.indexOf(delimiter);
  let type = value.substring(0, index);
  let sort = value.substring(index + 1);
  let obj = {
    type : type,
    sort : sort
  }
  let tree = gtiz_tree.tree;
  let category = tree.display_category;
  let category_info = tree.metadata_info[category];
  gtiz_legend.group_order = obj;
  category_info.grouptype = type;
  tree.changeCategory(category);
}

/**
 * Get the current color schema (colorscheme).
 * 
 * @returns String
 */
gtiz_legend.getColorScheme = function() {
  let tree = gtiz_tree.tree;
  let category = tree.display_category;
  let info = tree.metadata_info[category];
  let value = info.colorscheme;
  
  return value;
}

/**
 * Change color schema (colorscheme).
 * 
 * @param {String} value See context legend menu configuration for allowed values
 *  
 */
gtiz_legend.changeColorScheme = function(value) {
  let tree = gtiz_tree.tree;
  let category = tree.display_category;
  let category_info = tree.metadata_info[category];
  if (value !== category_info.colorscheme) {
    category_info.colorscheme = value;
    tree.changeCategory(category);
  }
}

/**
 * Change legend view mode: list mode or histogram mode.
 * 
 * @param {String} value `list` or `histogram` 
 * 
 */
gtiz_legend.toggleViewMode = function(value) {
  let legend = document.querySelector('.card-legend');
  gtiz_legend.view_mode = value;
  if (gtiz_legend.view_mode == 'list') {
    legend.classList.remove('card-legend-histogram');
    legend.classList.add('card-legend-list');
  } else {
    legend.classList.remove('card-legend-list');
    legend.classList.add('card-legend-histogram');
  }
}

/**
 * Order alphabetically the legend and apply a gradient color scheme
 * 
 */
gtiz_legend.quickGradient = function() {
  let order = 'alphabetic';
  let gradient = 'gradient_cool';
  let gradient_select = document.querySelector('#legend-menu-color-scheme');
  gradient_select.value = 'gradient_cool';
  let order_select = document.querySelector('#legend-menu-group-order');
  order_select.value = 'alphabetic-desc';
  gtiz_legend.changeGroupOrder(order);
  gtiz_legend.changeColorScheme(gradient);
}

/**
 * Node selection in qualitative mode
 * 
 * @param {Object} obj Object containing information about legend, category and item clicked
 * @param {Object} tree The tree object
 */
gtiz_legend.nodeSelection = function(obj, tree) {
  if (!tree) {
    tree = gtiz_tree.tree;
  }
  let category = obj ? obj.category : tree.display_category;
  // Retrieve an array of all values in `tree.metadata`
  let metadata = Object.values(tree.metadata);
  let node_ids = {};
  let items = document.querySelectorAll('.card-legend .list-row');
  tree.clearSelection();
  items.forEach(item => {
    if (item.classList.contains('selected')) {
      let group = item.getAttribute('data-real-group-izsam');
      // Filter the metadata values based on the condition `d[category] === group`
      let filtered = metadata.filter(function(d) {
        return d[category] === group;
      });
      // Iterate over the filtered metadata values and update `node_ids` object
      filtered.forEach(function(d) {
        node_ids[d.__Node] = 1;
      });
      // Filter the `tree.force_nodes` array based on matching `id` property with `node_ids` keys
      let filtered_force_nodes = tree.force_nodes.filter(function(n) {
        return node_ids[n.id];
      });
      // Set the `selected` property of each matched node to `true`
      filtered_force_nodes.forEach(function(n) {
        n.selected = true;
      });
    }
  });
  tree._updateSelectionStatus();
}

/**
 * Node selection in visual mode
 * 
 * @param {Object} obj Object containing information about legend, category and item clicked
 * @param {Object} tree The tree object
 */
gtiz_legend.highlightSelection = function (obj, tree) {
  if (!tree) {
    tree = gtiz_tree.tree;
  }
  let groups = [];
  let colors = [];
  let values = [];
  let path_parents = [];
  let current_category = obj ? obj.category : tree.display_category;
  let paths = document.querySelectorAll('#vis .node-paths');
  let links = document.querySelectorAll('#vis .link');
  let items = document.querySelectorAll('.card-legend .list-row');
  items.forEach(item => {
    if (item.classList.contains('selected')) {
      let color = item.getAttribute('data-group-colour-izsam');
      let value = item.getAttribute('data-real-group-izsam');
      let group = {
        value : value,
        color : color
      };
      groups.push(group);
      colors.push(color);
      values.push(value);
    }
  });
  paths.forEach(path => {
    let type = path.__data__.data.type;
    let group = groups.find(el => el.value == type);
    if (group) {
      let fill_color = group.color;
      path.setAttribute('fill', fill_color);
      path.setAttribute('style', 'stroke: black;');
      path.setAttribute('opacity', '1');
      path_parents.push(path.parentElement.id);
    } else {
      path.setAttribute('fill', 'url(#pattern)');
      path.setAttribute('style', 'stroke: rgba(0,0,0,0);');
      path.setAttribute('opacity', '0');
    }
  });
  links.forEach(link => {
    let line = link.querySelector('line');
    let link_id_arr = [];
    link_id_arr.push(link.__data__.source.id);
    link_id_arr.push(link.__data__.target.id);
    if (link_id_arr.every(item => path_parents.includes(item))) {
      line.setAttribute('style', 'stroke: black; stroke-dasharray: 0;');
    } else {
      line.setAttribute('style', 'stroke: rgba(0,0,0,0.2); stroke-dasharray: 2;');
    }
  });
  // gtiz_map.defineMarkers(gtiz_tree.filtered_nodes);
  gtiz_map.alterMarkers(colors);
}

/**
 * Select all legend items
 * 
 */
gtiz_legend.selectAll = function () {
  let selection_mode = gtiz_legend.selection_mode;
  let items = document.querySelectorAll('.card-legend .list-row');
  items.forEach(item => {
    item.classList.add('selected');
    let check = item.querySelector('.list-check');
    let icon = check.querySelector('i');
    icon.setAttribute('class', 'iconic iconic-check-circle');
  });
  if (selection_mode == 'qualitative') {
    gtiz_legend.nodeSelection();
  } else {
    gtiz_legend.highlightSelection();
  }
}

/**
 * Unselect all legend items
 * 
 */
gtiz_legend.unselectAll = function () {
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
}

/**
 * Invert selection of legend items
 * 
 */
gtiz_legend.invertSelection = function () {
  let selection_mode = gtiz_legend.selection_mode;
  let items = document.querySelectorAll('.card-legend .list-row');
  items.forEach(item => {
    let check = item.querySelector('.list-check');
    let icon = check.querySelector('i');
    if (item.classList.contains('selected')) {
      item.classList.remove('selected');
      icon.setAttribute('class', 'iconic iconic-check-circle-empty');
    } else {
      item.classList.add('selected');
      icon.setAttribute('class', 'iconic iconic-check-circle');
    }
  });
  if (selection_mode == 'qualitative') {
    gtiz_legend.nodeSelection();
  } else {
    gtiz_legend.highlightSelection();
  }
}

/**
 * Set UI for selection mode toggle on init
 * @param {String} value `qualitative` || `visual`
 * 
 */
gtiz_legend.setVisualSelectionToggle = function (value) {
  let menu = gtiz_legend.context_menu.find(el => el.id == 'legend-menu-selection-mode');
  menu.selected = gtiz_legend.selection_mode;
}

/**
 * Reset selection when in `visual` selection mode
 * 
 */
gtiz_legend.resetVisualSelection = function () {
  let groups = [];
  let colors = [];
  let values = [];
  let path_parents = [];
  let paths = document.querySelectorAll('#vis .node-paths');
  let links = document.querySelectorAll('#vis .link');
  let items = document.querySelectorAll('.card-legend .list-row');
  items.forEach(item => {
    item.classList.remove('selected');
    let check = item.querySelector('.list-check');
    let icon = check.querySelector('i');
    icon.setAttribute('class', 'iconic iconic-check-circle-empty');
    let color = item.getAttribute('data-group-colour-izsam');
    let value = item.getAttribute('data-real-group-izsam');
    let group = {
      value : value,
      color : color
    };
    groups.push(group);
    colors.push(color);
    values.push(value);
  });
  // reset tree nodes
  paths.forEach(path => {
    let type = path.__data__.data.type;
    let group = groups.find(el => el.value == type);
    if (group) {
      let fill_color = group.color;
      path.setAttribute('fill', fill_color);
      path.setAttribute('style', 'stroke: black;');
      path.setAttribute('opacity', '1');
      path_parents.push(path.parentElement.id);
    } else {
      path.setAttribute('fill', "#ffffff");
      path.setAttribute('style', 'stroke: black;');
      path.setAttribute('opacity', '1');
    }
  });
  // reset tree links
  links.forEach(link => {
    let line = link.querySelector('line');
    line.setAttribute('style', 'stroke: black; stroke-dasharray: 0;');
  });
  gtiz_tree.filtered_nodes = [];
  gtiz_map.defineMarkers();
}

/**
 * Reset selection when in `qualitative` selection mode.
 * 
 */
gtiz_legend.resetQualitativeSelection = function() {
  let items = document.querySelectorAll('.card-legend .list-row');
  items.forEach(item => {
    item.classList.remove('selected');
    let check = item.querySelector('.list-check');
    let icon = check.querySelector('i');
    icon.setAttribute('class', 'iconic iconic-check-circle-empty');
  });
  gtiz_tree.tree.clearSelection();
  gtiz_tree.tree._updateSelectionStatus();
}

/**
 * Toggle selection mode
 * 
 * @param {String} value `qualitative` || `visual`
 */
gtiz_legend.toggleSelectionMode = function(value) {
  if (gtiz_legend.selection_mode == 'visual') {
    gtiz_legend.resetVisualSelection();
  } else {
    gtiz_legend.resetQualitativeSelection();
  }
  gtiz_legend.selection_mode = value;
  let menu = gtiz_legend.context_menu.find(el => el.id == 'legend-menu-selection-mode');
  menu.selected = value;
  if (gtiz_legend.selection_mode == 'visual') {
    gtiz_legend.highlightSelection();
  }
}

gtiz_legend.setSelection = function() {
  if (gtiz_legend.selection_map) {
    let selection_mode = gtiz_legend.selection_mode;
    let items = document.querySelectorAll('.card-legend .list-row');
    gtiz_legend.selection_map.forEach((selected, index) => {
      if (selected) {
        let item = items[index];
        item.classList.add('selected');
        let check = item.querySelector('.list-check');
        let icon = check.querySelector('i');
        icon.setAttribute('class', 'iconic iconic-check-circle');
      }
    });
    if (selection_mode == 'qualitative') {
      gtiz_legend.nodeSelection();
    } else {
      gtiz_legend.highlightSelection();
    }
  }
}

gtiz_legend.getSelectionMap = function() {
  let selection = [];
  let items = document.querySelectorAll('.card-legend .list-row');
  items.forEach(item => {
    if (item.classList.contains('selected')) {
      selection.push(true);
    } else {
      selection.push(false);
    }
  });
  return selection;
}

gtiz_legend.init = function() {
  gtiz_legend.toggleViewMode(gtiz_legend.view_mode);
  gtiz_legend.setVisualSelectionToggle(gtiz_legend.selection_mode);
  let order = gtiz_legend.group_order.type + '-' + gtiz_legend.group_order.sort;
  gtiz_legend.changeGroupOrder(order);
  gtiz_legend.setSelection();
}