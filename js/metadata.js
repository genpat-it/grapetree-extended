let gtiz_metadata = {};

gtiz_metadata.show_nodes = 'show_all';
gtiz_metadata.show_hypothetical = 'hide_hypo';
gtiz_metadata.selected_column = '';

gtiz_metadata.metadata_node = document.querySelector(".metadata");
gtiz_metadata.grid_div = document.getElementById("metadata-grid");

/**
 * Options definition for ag-grid library
 * 
 */
gtiz_metadata.options = {
  // default col def properties get applied to all columns
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true
  },
  rowSelection: 'multiple',
  rowMultiSelectWithClick : true,
  animateRows: true, // have rows animate to new positions when sorted
  suppressColumnVirtualisation : true,
  onRowClicked: (event) => {
    gtiz_metadata.onRowClicked(event.node);
  },
  isExternalFilterPresent: () => {
    let present = gtiz_metadata.isExternalFilterPresent();
    return present;
  },
  doesExternalFilterPass: (node) => {
    let filtered = gtiz_metadata.doesExternalFilterPass(node);
    return filtered;
  }
};

/**
 * Should return true if external filter passes, otherwise false.
 * https://www.ag-grid.com/javascript-data-grid/filter-external/
 * 
 * @param {Object} node Row object
 * @returns Boolean
 */
gtiz_metadata.doesExternalFilterPass = function(node) {
  if (node) {
    if (gtiz_metadata.show_nodes == 'show_selected') {
      if (!node.isSelected()) {
        return false;
      }
    }
    if (gtiz_metadata.show_hypothetical == 'hide_hypo') {
      if (node.data.ID.includes('_hypo')) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Grid calls this method to know if an external filter is present. `isExternalFilterPresent` is called exactly once every time the grid senses a filter change. It should return true if external filtering is active or false otherwise.
 * 
 * If you return true, `doesExternalFilterPass` will be called while filtering, otherwise `doesExternalFilterPass` will not be called.
 * 
 * https://www.ag-grid.com/javascript-data-grid/filter-external/
 * 
 * @returns Boolean
 * 
 */
gtiz_metadata.isExternalFilterPresent = function() {
  if (gtiz_metadata.show_nodes !== 'show_all' || gtiz_metadata.show_hypothetical !== 'show_hypo') {
    return true;
  } else {
    return false;
  }
}

/**
 * Change grid filter to show/hide _hypo.
 * 
 * @param {String} value `show_hypo` || `hide_hypo`
 * 
 */
gtiz_metadata.toggleShowHypotetical = function(value) {
  gtiz_metadata.show_hypothetical = value;
  gtiz_metadata.options.api.onFilterChanged();
}

/**
 * Change grid filter for selected items.
 * 
 * @param {String} value `show_all` || `show_selected`
 * 
 */
gtiz_metadata.toggleShowSelected = function(value) {
  gtiz_metadata.show_nodes = value;
  gtiz_metadata.options.api.onFilterChanged();
}

/**
 * Call `tiz_legend.changeCategoryColor` to change figure legend.
 * 
 */
gtiz_metadata.setColumnsAsLegend = function() {
  let value = gtiz_metadata.selected_column;
  gtiz_legend.changeCategoryColor(value);
}

/**
 * Move selected columns in first position. Moves a column to `toIndex`. The column is first removed, then added at the `toIndex` location, thus index locations will change to the right of the column after the removal.
 * 
 * https://www.ag-grid.com/javascript-data-grid/column-moving/
 * 
 */
gtiz_metadata.moveColumn = function() {
  let column = gtiz_metadata.selected_column;
  let position = 0;
  gtiz_metadata.options.columnApi.moveColumn(column, position);
}

/**
 * Change color by category
 * 
 * @param {String} value Category
 */
gtiz_metadata.changeCategoryColor = function(value) {
  gtiz_metadata.selected_column = value;
}

/**
 * Get current active category to set color by form value in context menu
 * 
 * @returns category
 */
gtiz_metadata.getColorByDefaultValue = function() {
  let tree = gtiz_tree.tree;
  let category = tree.display_category;
  gtiz_metadata.selected_column = category;
  return category;
}

/**
 * Retreive the metadata category list to populate relative metadata context menu select input.
 * 
 * @returns colors An array of object with value and label of available catgories
 */
gtiz_metadata.getColorByOptions = function() {
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
 * Export table as csv
 * 
 * https://www.ag-grid.com/javascript-data-grid/csv-export/
 * 
 */
gtiz_metadata.downloadCsv = function() {
  gtiz_metadata.options.api.exportDataAsCsv();
}

/**
 * Event called when raw is clicked.
 * 
 * @param {Object} node Grid row object
 *  
 */
gtiz_metadata.onRowClicked = function(node) {
  let codes = [];
  if (node.isSelected()) {
    gtiz_metadata.options.api.forEachNode(element => {
      if (element.isSelected()) {
        codes.push(element.data.ID);
      }
    });
    gtiz_tree.tree.clearSelection();
    gtiz_tree.tree.selectNodesByIds(codes);
  } else {
    gtiz_metadata.options.api.forEachNode(element => {
      if (!element.isSelected() && !element.data.ID.includes('hypo')) {
        codes.push(element.data.ID);
      }
    });
    gtiz_tree.tree.unselectNodesByIds(codes);
  }
}

/**
 * Select all event, we select directly on tree ad by reflection `tree.interceptor` set rows selection with `gtiz_metadata.findNodes`.
 * 
 */
gtiz_metadata.selectAll = function() {
  gtiz_tree.tree.selectAll();
}

/**
 * Deselect all event, we deselect directly on tree ad by reflection `tree.interceptor` set rows selection with `gtiz_metadata.findNodes`.
 * 
 */
gtiz_metadata.deselectAll = function() {
  gtiz_tree.tree.clearSelection();
}

/**
 * Called by tree.interceptr on tree selection change.
 * 
 * @param {Object} nodes Object containing information non selected nodes.
 * 
 */
gtiz_metadata.findNodes = function(nodes) {
  let selected = Object.values(nodes).flat();
  if (gtiz_metadata.options.api) {
    gtiz_metadata.options.api.forEachNode(node => {
      let id = selected.find(element => element === node.data.ID);
      if (id) {
        node.setSelected(true);
      } else {
        node.setSelected(false);
      }
    });
  }
}

/**
 * Build the ui for the metadata card based on `gtiz_metadata.card_menu`. In this case we build the header buttons of the card.
 * 
 */
gtiz_metadata.buildUi = function() {
  let form = gtiz_metadata.metadata_node.querySelector('.card-form');
  form.innerHTML = '';
  let menu = gtiz_metadata.card_menu;
  menu.forEach(item => {
    if (item.type == 'button') {
      let box = document.createElement('div'); 
      box.setAttribute('class', 'button-box');
      let a = document.createElement('a');
      a.setAttribute('class', 'card-action');
      let icon = item.icon != '' ? '<i class="iconic ' + item.icon + '"></i> ' : '';
      a.innerHTML = icon + item.label;
      a.addEventListener('click', (e) => {
        item.function();
      });
      box.append(a);
      form.append(box);
    }
  });
}

/**
 * Set grid contents from metadata tree informations.
 * 
 */
gtiz_metadata.setGrid = function() {
  let fields = Object.keys(gtiz_tree.tree.metadata_info);
  let meta = gtiz_tree.tree.metadata;
  let columns = [];
  columns.push();
  Object.keys(fields).forEach((key, index) => {
    if (fields[key] != 'nothing') {
      let obj = {
        field : fields[key]
      }
      columns.push(obj);
    }
  });
  let contents = [];
  Object.keys(meta).forEach((key) => {
    let control = fields.find(el => el == key);
    // if (!key.includes('_hypo') && key != '') { // exclude _hypo by default
    if (key != '') {
      if (!control) {
        let obj = {...meta[key]};
        if (obj.__Node) {
          delete obj.__Node;
        }
        contents.push(obj);
      }
    }
  });
  gtiz_metadata.options.api.setColumnDefs(columns);
  gtiz_metadata.options.api.setRowData(contents);
  gtiz_metadata.options.columnApi.autoSizeAllColumns(false);
}

/**
 * Metadata table initialization.
 * 
 */
gtiz_metadata.init = function() {
  if (gtiz_metadata.options.api) {
    gtiz_metadata.options.api.destroy();
  }
  new agGrid.Grid(gtiz_metadata.grid_div, gtiz_metadata.options);
  gtiz_metadata.setGrid();
  gtiz_metadata.buildUi();
}

/**
 * Card header menu definition.
 * 
 */
gtiz_metadata.card_menu = [{
  type : 'button',
  label : gtiz_locales.current.select_all,
  icon : 'iconic-check-circle',
  function : () => {
    gtiz_metadata.selectAll();
  }
}, {
  type : 'button',
  label : gtiz_locales.current.clean_selection,
  icon : 'iconic-minus-circle',
  function : () => {
    gtiz_metadata.deselectAll();
  }
}];

/**
 * Card context menu definition
 * 
 */
gtiz_metadata.context_menu = [{
  type : 'toggle',
  id : 'metadata-selected-only',
  options : [{
      label : () => {
        return gtiz_locales.current.selected_only;
      },
      value : 'show_selected',
      icon : 'iconic-eye'
    }, {
      label : () => {
        return gtiz_locales.current.selected_only;
      },
      value : 'show_all',
      icon : 'iconic-eye-off'
  }],
  selected : () => {
    return  gtiz_metadata.show_nodes;
  },
  function : (value) => {
    gtiz_metadata.toggleShowSelected(value);
  }
}, {
  type : 'separator'
}, {
  type : 'select',
  id : 'metadata-menu-color-by',
  label : () => {
    return gtiz_locales.current.column_selection;
  },
  icon : '',
  options : () => {
    let values = gtiz_metadata.getColorByOptions();
    return values;
  },
  default : undefined,
  get_default : () => {
    let value = gtiz_metadata.getColorByDefaultValue();
    return value;
  },
  function : (value) => {
    gtiz_metadata.changeCategoryColor(value);
  }
}, {
  type : 'button',
  label : () => {
    return gtiz_locales.current.move_to_first_position;
  },
  icon : 'iconic-undo',
  function : () => {
    gtiz_metadata.moveColumn();
  }
}, {
  type : 'button',
  label : () => {
    return gtiz_locales.current.set_as_figure_legend;
  },
  icon : 'iconic-bookmark',
  function : () => {
    gtiz_metadata.setColumnsAsLegend();
  }
}, {
  type : 'separator'
}, {
  type : 'button',
  label : () => {
    return gtiz_locales.current.resize_columns;
  },
  icon : 'iconic-columns-vertical',
  function : () => {
    gtiz_metadata.options.columnApi.autoSizeAllColumns(false);
  }
}, {
  type : 'separator'
}, {
  type : 'toggle',
  id : 'metadata-show-hypo',
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
    return  gtiz_metadata.show_hypothetical;
  },
  function : (value) => {
    gtiz_metadata.toggleShowHypotetical(value);
  }
}, {
  type : 'separator'
}, {
  type : 'button',
  label : () => {
    return gtiz_locales.current.download_table + ' (.csv)';
  },
  icon : 'iconic-file-text',
  function : () => {
    gtiz_metadata.downloadCsv();
  }
}];