let gtiz_layout = {};

gtiz_layout.settings = 'off';
gtiz_layout.map = 'off';
gtiz_layout.legend = 'off';
gtiz_layout.metadata = 'off';
gtiz_layout.video = 'on';
gtiz_layout.fullscreen = 'off';

gtiz_layout.cfg = [{
  type: 'settings',
  visible: false,
  cls : '',
  cls_suffix: '-s',
  position: 'left',
  options : [{
      label : gtiz_locales.current.settings,
      value : 'on',
      icon : 'iconic-settings-sliders'
    }, {
      label : gtiz_locales.current.settings,
      value : 'off',
      icon : 'iconic-ban'
  }],
  selected : () => {
    return  gtiz_layout.settings;
  },
  function : (type, value) => {
    gtiz_layout.toggleView(type, value);
  }
}, {
  type: 'map',
  visible: false,
  cls : '',
  cls_suffix: '-m',
  position: 'left',
  options : [{
      label : gtiz_locales.current.map,
      value : 'on',
      icon : 'iconic-pin'
    }, {
      label : gtiz_locales.current.map,
      value : 'off',
      icon : 'iconic-ban'
  }],
  selected : () => {
    return  gtiz_layout.map;
  },
  function : (type, value) => {
    gtiz_layout.toggleView(type, value);
  }
}, {
  type: 'metadata',
  visible: false,
  cls : '',
  cls_suffix: '-mt',
  position: 'left',
  options : [{
      label : gtiz_locales.current.metadata,
      value : 'on',
      icon : 'iconic-dashboard'
    }, {
      label : gtiz_locales.current.metadata,
      value : 'off',
      icon : 'iconic-ban'
  }],
  selected : () => {
    return  gtiz_layout.metadata;
  },
  function : (type, value) => {
    gtiz_layout.toggleView(type, value);
  }
}, {
  type: 'legend',
  visible: false,
  cls : '',
  cls_suffix: '-l',
  position: 'left',
  options : [{
      label : gtiz_locales.current.legend,
      value : 'on',
      icon : 'iconic-legend'
    }, {
      label : gtiz_locales.current.legend,
      value : 'off',
      icon : 'iconic-ban'
  }],
  selected : () => {
    return  gtiz_layout.legend;
  },
  function : (type, value) => {
    gtiz_layout.toggleView(type, value);
  }
}, {
  type: 'video',
  visible: false,
  cls : 'video-mode',
  cls_suffix: '',
  position: 'right',
  options : [{
      label : gtiz_locales.current.video,
      value : 'on',
      icon : 'iconic-video-camera'
    }, {
      label : gtiz_locales.current.video,
      value : 'off',
      icon : 'iconic-video-camera-off'
  }],
  selected : () => {
    return  gtiz_layout.video;
  },
  function : (type, value) => {
    gtiz_layout.toggleView(type, value);
  }
}, {
  type: 'full-screen',
  visible: true,
  cls : 'full-screen-mode',
  cls_suffix: '',
  position: 'right',
  options : [{
      label : gtiz_locales.current.fullscreen,
      value : 'on',
      icon : 'iconic-maximize'
    }, {
      label : gtiz_locales.current.fullscreen,
      value : 'off',
      icon : 'iconic-minimize'
  }],
  selected : () => {
    return  gtiz_layout.fullscreen;
  },
  function : (type, value) => {
    gtiz_layout.setFullScreen(type, value);
  }
}];

gtiz_layout.body = document.querySelector('body');
gtiz_layout.main_node = document.querySelector('main');
gtiz_layout.quick_actions_node = gtiz_layout.main_node.querySelector('.quick-actions');
gtiz_layout.main_section = document.querySelector('.main');
gtiz_layout.settings_node = document.querySelector('.settings');
gtiz_layout.tree_node = document.querySelector('.tree');
gtiz_layout.map_node = document.querySelector('.map');
gtiz_layout.legend_node = document.querySelector('.legend');
gtiz_layout.view_triggers = document.querySelectorAll('[data-view-trigger]');

gtiz_layout.getStyleTime = function(node) {
  let styles = window.getComputedStyle(node);
  let duration = styles.getPropertyValue("transition-duration");
  let delay = styles.getPropertyValue("transition-delay");
  duration = parseFloat(duration);
  delay = parseFloat(delay);
  let time = (duration + delay) * 1000;
  return time;
}

/**
 * Manage footer view.
 * 
 */
gtiz_layout.showFooter = function() {
  let footer = document.querySelector('footer');
  let trigger_help = document.querySelector('.toogle-trigger-img-help');
  let trigger_close = document.querySelector('.toogle-trigger-img-close');
  footer.classList.toggle('show');
  trigger_help.classList.toggle('hidden');
  trigger_close.classList.toggle('hidden');
}

/**
 * Manage loading Ui for tree component
 * 
 * @param {Array} component ['tree', 'map', 'legend'] 
 * @param {String} action 'add' || 'remove'
 * 
 */
gtiz_layout.uiLoadingManager = function(components, action) {
  if (components) {
    components.forEach(component => {
      let node = undefined;
      if (component == 'tree') {
        let body = document.querySelector('body');
		    body.classList.remove('tree-not-defined');
        node = document.querySelector('.tree-container');
        if (action == 'add') {
          node.classList.add('tree-loading');
        } else {
          node.classList.remove('tree-loading');
        }
      }
      if (component == 'map') {
        node = document.querySelector('.map-container');
      }
      if (component == 'legend') {
        node = document.querySelector('.legend .card-legend');
        if (action == 'add') {
          node.classList.add('legend-loading');
        } else {
          node.classList.remove('legend-loading');
        }
      }
      if (action == 'add') {
        gtiz_loader.addLoader(node);
      } else {
        gtiz_loader.removeLoader(node);
      }
    });
  }
}

/**
 * Set height for the legend.
 * 
 * @param {Number} time Timing from css rules for legend
 */
gtiz_layout.setLegendHeight = function(time) {
  let delay = time ? time : 0;
  setTimeout(() => {
    let legend_card = document.querySelector('.card-legend');
    let legend_form = legend_card.querySelector('.card-form');
    // reset height
    legend_form.removeAttribute('style');
    legend_card.style.height = 'auto';
    let legend_card_h = legend_card.offsetHeight;
    let legend_node = legend_card.parentNode;
    let legend_node_h = legend_node.offsetHeight;
    let legend_player_h = 0;
    let legend_form_top = legend_form.offsetTop;
    if (gtiz_layout.body.classList.contains('video-mode')) {
      let legend_player = document.querySelector('.card-player');
      legend_player_h = parseInt(getComputedStyle(legend_player).paddingTop) +
      parseInt(getComputedStyle(legend_player).paddingBottom) +
      parseInt(getComputedStyle(legend_player).marginTop) +
      parseInt(getComputedStyle(legend_player).marginBottom) +
      parseInt(getComputedStyle(legend_player).height);
    }
    if (legend_card_h > legend_node_h) {
      let height = legend_node_h - 
      parseInt(getComputedStyle(legend_card).paddingTop) -
      parseInt(getComputedStyle(legend_card).paddingBottom) -
      parseInt(getComputedStyle(legend_card).marginTop) -
      parseInt(getComputedStyle(legend_card).marginBottom) -
      legend_player_h;
      legend_card.style.height = height/10 + 'rem';
      legend_form.style.height = (legend_card.offsetHeight - legend_form_top)/10 + 'rem';
    } else {
      legend_card.style.height = 'auto';
      legend_form.removeAttribute('style');
    }
  }, delay);
}

/**
 * Set view height after layout changes in order to allow map and tree boxes to fit the entire page.
 * 
 * @param {Number} time Time definition for setTimeout based on css transition deleay and duration
 */
gtiz_layout.setViewHeight = function(time) {
  let delay = time ? time : 0;
  setTimeout(() => {
    let viewport_h = window.innerHeight;
    let settings_h = gtiz_layout.settings_node.offsetHeight;
    let offset = gtiz_layout.main_section.offsetTop;
    let control = viewport_h - offset;
    if (settings_h > control) {
      gtiz_layout.main_section.style.height = settings_h + 'px';
    } else {
      gtiz_layout.main_section.setAttribute('style', '');
    }
  }, delay);
}

/**
 * Resize the map after layout changes.
 * 
 * @param {Number} time Time definition for setTimeout based on css transition deleay and duration
 */
gtiz_layout.resizeMap = function (time) {
  let delay = time ? time : 0;
  setTimeout(() => {
    if (gtiz_map.initialized) {
      map.invalidateSize();
      /**
       * Set min zoom to avoid empty space around world edges
       * 
       */
      let width = gtiz_map.map_container.clientWidth;
      let height = gtiz_map.map_container.clientHeight;
      let min_zoom = Math.ceil(Math.log2(Math.max(width, height) / 256));
      map.setMinZoom(min_zoom);
      if (pointLayer.getBounds()) {
        map.fitBounds(pointLayer.getBounds(), {
          padding: [42, 42]
        });
      }
    }
  }, delay);
}

/**
 * Resize and center the tree after layout changes.
 * 
 * @param {Number} time Time definition for setTimeout based on css transition deleay and duration
 */
gtiz_layout.resizeTree = function (time) {
  let delay = time ? time : 0;
  setTimeout(() => {
    if (gtiz_tree.tree) {
      gtiz_tree.tree.resize();
      gtiz_tree.tree.centerGraph();
    }
    let graph_div = document.querySelector('#graph-div');
    if (!graph_div.classList.contains('show')) {
      graph_div.classList.add('show');
    }
  }, delay);
}

/**
 * Resize legend card.
 * 
 * @param {Number} time Time definition for setTimeout based on css transition deleay and duration
 */
gtiz_layout.resizeLegend = function (time) {
  let delay = time ? time : 0;
  let legend_h = gtiz_layout.legend_node.offsetHeight;
  let card = gtiz_layout.legend_node.querySelector('.card-legend');
  let card_h = card.offsetHeight;
  if (card_h > legend_h) {
    let height = legend_h - 
      parseInt(getComputedStyle(card).paddingTop) -
      parseInt(getComputedStyle(card).paddingBottom) -
      parseInt(getComputedStyle(card).marginTop) -
      parseInt(getComputedStyle(card).marginBottom);
      card.style.height = height/10 + 'rem';
  } else {
    card.style.height = 'auto';
  }
}

/**
 * Set the view based on the configuration object.
 * 
 * @param {Array} obj Layout configuration object
 */
gtiz_layout.setView = function(obj) {
  if (gtiz_layout.body.classList.contains('show-notifier')) {
    gtiz_layout.body.setAttribute('class', 'show-notifier dashboard dashboard-grapetree');
  } else {
    gtiz_layout.body.setAttribute('class', 'dashboard dashboard-grapetree');
  }
  if (!gtiz_tree.tree) {
    gtiz_layout.body.classList.add('tree-not-defined');
  }
  let trigger_nodes = gtiz_layout.quick_actions_node.querySelectorAll('[data-view]');
  let triggers = [...trigger_nodes];
  let cls = 'dashboard-grapetree';
  let additional_cls = [];
  triggers.forEach(trigger => {
    let view = trigger.getAttribute('data-view');
    let selection = trigger.getAttribute('data-selection');
    if (selection == 'on') {
      let obj = gtiz_layout.cfg.find(element => element.type == view);
      if (obj.cls_suffix && obj.cls_suffix != '') {
        cls += obj.cls_suffix;
      }
      if (obj.cls && obj.cls != '') {
        additional_cls.push(obj.cls);
      }
    }
  });
  gtiz_layout.body.classList.add(cls);
  if (additional_cls.length > 0) {
    additional_cls.forEach(element => {
      gtiz_layout.body.classList.add(element);
    });
  }
  gtiz_layout.setViewHeight();
  if (gtiz_layout.legend == 'on') {
    gtiz_layout.setLegendHeight();
  }
  if (gtiz_layout.settings == 'on') {
    gtiz_settings.init();
  }
  if (gtiz_layout.map == 'on' && gtiz_map.initialized) {
    gtiz_map.init();
    gtiz_layout.resizeMap();
  }
  if (gtiz_layout.metadata == 'on') {
    gtiz_metadata.options.columnApi.autoSizeAllColumns(false);
  }
  gtiz_layout.resizeTree();
};

gtiz_layout.buildToolsUi = function(obj) {
  let left_node = gtiz_layout.quick_actions_node.querySelector('.tools-left');
  let right_node = gtiz_layout.quick_actions_node.querySelector('.tools-right');
  left_node.innerHTML = '';
  right_node.innerHTML = '';
  obj.forEach(item => {
    if (item.visible) {
      let box = document.createElement('div'); 
      box.setAttribute('class', 'toggle-box');
      box.setAttribute('data-selection', item.options[0].value);
      box.setAttribute('data-view', item.type);
      let label = document.createElement('div');
      label.setAttribute('class', 'label');
      let toggle = document.createElement('div');
      toggle.setAttribute('class', 'toggle');
      let selected;
      if (typeof item.selected === 'string') {
        selected = item.selected;
      } else {
        if (typeof item.selected === 'function')
        selected = item.selected();
      }
      item.options.forEach((option, index) => {
        if (option.value == selected) {
          box.setAttribute('data-selection', option.value);
          label.innerHTML = ' ' + option.label;
          if (index === 0) {
            toggle.classList.add('toggled-first-option');
          } else {
            toggle.classList.add('toggled-second-option');
          }
        }
        let node = document.createElement('div');
        node.setAttribute('class', 'toggle-option');
        let icon = option.icon != '' ? '<i class="iconic ' + option.icon + '"></i> ' : '';
        node.innerHTML = icon;
        toggle.append(node);
      });
      box.addEventListener('click', (e) => {
        toggle.classList.toggle('toggled-first-option');
        toggle.classList.toggle('toggled-second-option');
        let value = box.getAttribute('data-selection');
        if (value === item.options[0].value) {
          let value = item.options[1].value;
          let type = item.type;
          box.setAttribute('data-selection', value);
          label.innerHTML = ' ' + item.options[1].label;
          item.function(type, value);
        } else {
          let value = item.options[0].value;
          let type = item.type;
          box.setAttribute('data-selection', value);
          label.innerHTML = ' ' + item.options[0].label;
          item.function(type, value);
        }
      });
      if (item.position === 'left') {
        box.append(toggle);
        box.append(label);
        left_node.append(box);
      } else if (item.position === 'right') {
        box.append(label);
        box.append(toggle);
        right_node.append(box);
      }
    }
  });
  gtiz_layout.setView(obj);
}

gtiz_layout.setFullScreen = function(value) {
  let isFullscreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
  if (isFullscreen) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari, Opera
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // Internet Explorer and Edge
      document.msExitFullscreen();
    }
  } else {
    if (gtiz_layout.main_node.requestFullscreen) {
      gtiz_layout.main_node.requestFullscreen();
    } else if (gtiz_layout.main_node.mozRequestFullScreen) { // Firefox
      gtiz_layout.main_node.mozRequestFullScreen();
    } else if (gtiz_layout.main_node.webkitRequestFullscreen) { // Chrome, Safari, Opera
      gtiz_layout.main_node.webkitRequestFullscreen();
    } else if (gtiz_layout.main_node.msRequestFullscreen) { // Internet Explorer and Edge
      gtiz_layout.main_node.msRequestFullscreen();
    }
  }
}

gtiz_layout.toggleMetadata = function(type, value) {
  gtiz_layout.metadata = value;
}

/**
 * Toggle the component visibility
 * 
 * @param {String} type Component type (legend, map etc.) 
 * @param {*} value on || off
 * 
 */
gtiz_layout.toggleView = function(type, value) {
  gtiz_layout[type] = value;
  gtiz_layout.setView(gtiz_layout.cfg);
};

gtiz_layout.init = function() {
  if (gtiz_tree.tree) {
    gtiz_layout.cfg.forEach(item => {
      item.visible = true;
    });
  }
  gtiz_layout.buildToolsUi(gtiz_layout.cfg);
}

document.addEventListener("fullscreenchange", function(e) {
  if (gtiz_layout.fullscreen == 'on') {
    gtiz_layout.fullscreen = 'off';
  } else {
    gtiz_layout.fullscreen = 'on';
  }
  gtiz_layout.init();
});

window.addEventListener("resize", function() {
  gtiz_layout.setViewHeight(800);
  let map_cfg = gtiz_layout.cfg.find(element => element.type === 'map');
  if (map_cfg.visible && gtiz_map.geojson != '') {
    let map_time = gtiz_layout.getStyleTime(gtiz_layout.map_node);
    gtiz_layout.resizeMap(map_time);
  }
  let tree_time = gtiz_layout.getStyleTime(gtiz_layout.tree_node);
  gtiz_layout.resizeTree(tree_time);
  let legend_cfg = gtiz_layout.cfg.find(element => element.type === 'legend');
  if (legend_cfg.visible) {
    let legend_time = gtiz_layout.getStyleTime(gtiz_layout.legend_node);
    gtiz_layout.setLegendHeight(legend_time);
  }
});
