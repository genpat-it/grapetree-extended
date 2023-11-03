let gtiz_context = {};
gtiz_context.cfg = [];
gtiz_context.menus = ['tree', 'legend', 'metadata', 'map'];
gtiz_context.body = document.querySelector('body');
gtiz_context.triggers = document.querySelectorAll('.card-context-menu-trigger');
gtiz_context.graph_div = document.querySelector('#graph-div');
gtiz_context.legend_div = document.querySelector('.card-legend');
gtiz_context.metadata_div = document.querySelector('.card-metadata');
gtiz_context.legend_div = document.querySelector('.card-legend');
gtiz_context.map_div = document.querySelector('.map-container');
gtiz_context.legendToggleSelectionMode = function (value) {
  gtiz_legend.toggleSelectionMode(value);
}

/**
 * Build the context menu contents based on the user request
 * 
 * @param {String} type 'legend' || 'tree' || 'metadata' based on the available context menus 
 * @returns DOM node containing the UI contents
 */
gtiz_context.getMenu = function(type) {
  let form = document.createElement('div');
  form.setAttribute('class', 'card-form');
  let cfg;
  switch (type) {
    case 'legend':
      cfg = gtiz_legend.context_menu;
      break;
    case 'tree':
      cfg = gtiz_tree.context_menu;
      break;
    case 'metadata':
      cfg = gtiz_metadata.context_menu;
      break;
    case 'map':
      cfg = gtiz_map.context_menu;
      break;
    default:
      console.log(`Sorry, we are out of ${type}.`);
  }
  cfg.forEach(item => {
    if (item.type == 'toggle') {
      let container = document.createElement('div');
      container.setAttribute('class', 'tools');
      let box = document.createElement('div'); 
      box.setAttribute('class', 'toggle-box');
      box.setAttribute('data-selection', item.options[0].value);
      box.setAttribute('id', item.id);
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
          if (typeof option.label === 'string') {
            label.innerHTML = ' ' + option.label;
          } else {
            if (typeof option.label === 'function') {
              let label_text = option.label();
              label.innerHTML = ' ' + label_text;
            }
          }
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
      box.append(toggle);
      box.append(label);
      box.addEventListener('click', (e) => {
        toggle.classList.toggle('toggled-first-option');
        toggle.classList.toggle('toggled-second-option');
        let value = box.getAttribute('data-selection');
        if (value === item.options[0].value) {
          box.setAttribute('data-selection', item.options[1].value);
          if (typeof item.options[1].label === 'string') {
            label.innerHTML = ' ' + item.options[1].label;
          } else {
            if (typeof item.options[1].label === 'function') {
              let label_text = item.options[1].label();
              label.innerHTML = ' ' + label_text;
            }
          }
          item.function(item.options[1].value);
        } else {
          box.setAttribute('data-selection', item.options[0].value);
          if (typeof item.options[0].label === 'string') {
            label.innerHTML = ' ' + item.options[0].label;
          } else {
            if (typeof item.options[0].label === 'function') {
              let label_text = item.options[0].label();
              label.innerHTML = ' ' + label_text;
            }
          }
          item.function(item.options[0].value);
        }
      });
      container.append(box);
      form.append(container);
    }
    if (item.type == 'button') {
      let box = document.createElement('div'); 
      box.setAttribute('class', 'button-box');
      let a = document.createElement('a');
      a.setAttribute('class', 'card-action');
      let icon = item.icon != '' ? '<i class="iconic ' + item.icon + '"></i> ' : '';
      if (typeof item.label === 'string') {
        a.innerHTML = icon + item.label;
      } else {
        if (typeof item.label === 'function') {
          let label_text = item.label();
          a.innerHTML = icon + label_text;
        }
      }
      a.addEventListener('click', (e) => {
        item.function();
      });
      box.append(a);
      form.append(box);
    }
    if (item.type == 'select') {
      let box = document.createElement('div'); 
      box.setAttribute('class', 'select-box');
      if (item.label) {
        let label = document.createElement('div');
        label.setAttribute('class', 'form-label');
        let icon = item.icon != '' ? '<i class="iconic ' + item.icon + '"></i> ' : '';
        if (typeof item.label === 'string') {
          label.innerHTML = icon + item.label;
        } else {
          if (typeof item.label === 'function') {
            let label_text = item.label();
            label.innerHTML = icon + label_text;
          }
        }
        box.append(label);
      }
      let select = document.createElement('select');
      if (item.id) {
        select.setAttribute('id', item.id);
      }
      if (Array.isArray(item.options)) {
        let options = item.options;
        options.forEach(el => {
          let option = document.createElement('option');
          option.setAttribute('value', el.value);
          if (typeof el.label === 'string') {
            option.innerHTML = el.label;
          } else {
            if (typeof el.label === 'function') {
              let label_text = el.label();
              option.innerHTML = label_text;
            }
          }
          select.append(option);
        });
      } else {
        if (typeof item.options === 'function') {
          let options = item.options();
          options.forEach(el => {
            let option = document.createElement('option');
            option.setAttribute('value', el.value);
            option.innerHTML = el.label;
            select.append(option);
          });
        }
      }
      if (item.default) {
        select.value = item.default;
      } else {
        if (typeof item.get_default === 'function') {
          let value = item.get_default();
          select.value = value;
        }
      }
      select.addEventListener('change', (e) => {
        item.function(select.value);
      });
      box.append(select);
      form.append(box);
    }
    if (item.type == 'number') {
      let box = document.createElement('div');
      box.setAttribute('class', 'input-box input-box-number');
      if (item.label) {
        let label = document.createElement('div');
        label.setAttribute('class', 'form-label');
        let icon = item.icon != '' ? '<i class="iconic ' + item.icon + '"></i> ' : '';
        if (typeof item.label === 'string') {
          label.innerHTML = icon + item.label;
        } else {
          if (typeof item.label === 'function') {
            let label_text = item.label();
            label.innerHTML = icon + label_text;
          }
        }
        box.append(label);
      }
      let input = document.createElement('input');
      input.setAttribute('type', 'number');
      if (item.id) {
        input.setAttribute('id', item.id);
      }
      if (item.min) {
        input.setAttribute('min', item.min);
      }
      if (item.max) {
        input.setAttribute('max', item.max);
      }
      if (item.default) {
        input.value = item.default;
      } else {
        if (typeof item.get_default === 'function') {
          let value = item.get_default();
          input.value = value;
        }
      }
      let events = ['change'];
      events.forEach((event) => {
        input.addEventListener(event, (e) => {
          let value = input.value;
          item.function(value);
        });
      });
      box.append(input);
      form.append(box);
    }
    if (item.type == 'separator') {
      let hr = document.createElement('hr');
      form.append(hr);
    }
  });

  return form;
}

gtiz_context.closeContextMenu = function(type) {
  let gtiz_context_node = document.querySelector('.context-menu');
  if (!type) {
    let cls = gtiz_context_node.getAttribute('class');
    gtiz_context.menus.forEach(menu => {
      if (cls.includes(menu)) {
        type = menu;
      }
    });
  }
  let specific_cls = 'show-context-menu-' + type;
  gtiz_context.body.classList.remove('show-context-menu');
  gtiz_context.body.classList.remove(specific_cls);
  gtiz_context_node.remove();
  let card_selector = '.card-' + type;
  let card_type = document.querySelector(card_selector);
  card_type.style.removeProperty('transform');
  card_type.style.removeProperty('z-index');
  if (type == 'tree') {
    let tree_container = document.querySelector('.tree');
    tree_container.style.removeProperty('z-index');
    tree_container.style.removeProperty('width');
  }
  if (type == 'metadata') {
    let metadata_container = document.querySelector('.metadata');
    metadata_container.style.removeProperty('transform');
    metadata_container.style.removeProperty('z-index');
    metadata_container.style.removeProperty('width');
  }
  if (type == 'map') {
    let map_container = document.querySelector('.map');
    map_container.style.removeProperty('transform');
    map_container.style.removeProperty('z-index');
    map_container.style.removeProperty('width');
  }
}

/**
 * Build the menu UI relative to the type requested by the user
 * 
 * @param {String} type 'legend' || 'tree' || 'metadata' based on the available context menus
 * @returns a DOM Node containing UI elements relative to the type
 */
gtiz_context.buildMenuUi = function(type) {
  let card = document.createElement('div');
  card.setAttribute('class', 'card card-context-menu expanded');
  let tools = document.createElement('div');
  tools.setAttribute('class', 'card-context-tools');
  let close = document.createElement('div');
  close.setAttribute('class', 'card-close-trigger');
  close.innerHTML = '<i class="iconic iconic-close-circle"></i>';
  close.addEventListener('click', (e) => {
    gtiz_context.closeContextMenu(type);
  });
  tools.append(close);
  card.append(tools);
  let title = document.createElement('h3');
  title.setAttribute('class', 'card-title');
  if (type == 'legend') {
    title.innerHTML = gtiz_locales.current.legend_tools;
  }
  if (type == 'metadata') {
    title.innerHTML = gtiz_locales.current.metadata_tools;
  }
  if (type == 'tree') {
    title.innerHTML = gtiz_locales.current.grapetree_tools;
  }
  if (type == 'map') {
    title.innerHTML = gtiz_locales.current.map_tools;
    let help = document.createElement('div');
    help.setAttribute('class', 'card-info-trigger');
    help.innerHTML = '<i class="iconic iconic-help-circle"></i>';
    help.addEventListener('click', (e) => {
      gtiz_help.getHelp(type);
    });
    tools.append(help);
  }
  card.append(title);
  let menu = gtiz_context.getMenu(type);
  card.append(menu);
  
  return card;
}

/**
 * Build and show context menu relative to clicked trigger
 * 
 * @param {String} type 'legend' || 'tree' || 'metadata' based on the available context menus
 * @param {Node} trigger DOM node clicked
 * 
 */
gtiz_context.showMenu = function(type, trigger) {
  let gtiz_context_node = document.querySelector('.context-menu');
  if (!gtiz_context_node) {
    let cls_controller = gtiz_context.body.getAttribute('class');
    let card = trigger.closest('.card-' + type);
    let card_style = getComputedStyle(card);
    let margin = parseInt(card_style.marginRight.replace(/\D/g, ""));
    let width = card.offsetWidth;
    let rect = card.getBoundingClientRect();
    let x = rect.left;
    let y = rect.top;
    let left = x;
    let top = y;
    let translate_value = -(width + margin)/10 + 'rem';
    if (type == 'tree') {
      if (!cls_controller.includes('-l')) {
        width = 320;
        translate_value = 0;
        if (gtiz_context.body.classList.contains('dashboard-grapetree-m') || gtiz_context.body.classList.contains('dashboard-grapetree-mt') || gtiz_context.body.classList.contains('dashboard-grapetree-m-mt')) {
          left = x + card.offsetWidth + margin;
        } else {
          left = x + card.offsetWidth + margin - width;
        }
      } else {
        let legend_width = document.querySelector('.card-legend').offsetWidth;
        width = legend_width;
        translate_value = 0;
        left = x + card.offsetWidth + margin;
      }
    }
    if (type == 'metadata') {
      if (!cls_controller.includes('-l')) {
        width = 320;
        translate_value = 0;
        left = x + card.offsetWidth + margin - width;
      } else {
        let legend_width = document.querySelector('.card-legend').offsetWidth;
        width = legend_width;
        translate_value = 0;
        left = x + card.offsetWidth + margin;
      }
    }
    if (type == 'map') {
      if (!cls_controller.includes('-l')) {
        width = 320;
        translate_value = 0;
        left = x + card.offsetWidth + margin - width;
      } else {
        let legend_width = document.querySelector('.card-legend').offsetWidth;
        width = legend_width;
        translate_value = 0;
        left = x + card.offsetWidth + margin;
      }
    }

    let menu_node = document.createElement('div');
    let cls = 'context-menu context-menu-' + type;
    menu_node.setAttribute('class', cls);
    menu_node.style.position = 'fixed';
    menu_node.style.top = top/10 + 'rem';
    menu_node.style.left = left/10 + 'rem';
    menu_node.style.bottom = 0;
    menu_node.style.zIndex = 9998;
    menu_node.style.width = width/10 + 'rem';
    menu_node.style.opacity = 0;
    menu_node.addEventListener('click', (e) => {
      if (e.target == menu_node) {
        gtiz_context.closeContextMenu(type);
      }
    });
    let menu_content = gtiz_context.buildMenuUi(type);
    menu_node.append(menu_content);

    // card style
    card.style.transform = `translateX(${translate_value})`;
    if (type == 'legend') {
      card.style.zIndex = 9999;
    }
    if (type == 'tree') {
      let tree_container = document.querySelector('.tree');
      tree_container.style.zIndex = 9999;
      if (!cls_controller.includes('-l') && !gtiz_context.body.classList.contains('dashboard-grapetree-m') && !gtiz_context.body.classList.contains('dashboard-grapetree-mt') && !gtiz_context.body.classList.contains('dashboard-grapetree-m-mt')) {
        // card.style.width = (card.offsetWidth - width)/10 + 'rem';
        tree_container.style.width = (card.offsetWidth + (2 * margin) - width)/10 + 'rem';
      }
      gtiz_layout.resizeTree();
    }
    if (type == 'metadata') {
      let metadata_container = document.querySelector('.metadata');
      metadata_container.style.zIndex = 9999;
      if (!cls_controller.includes('-l')) {
        // card.style.width = (card.offsetWidth - width)/10 + 'rem';
        metadata_container.style.transform = 'translateX(-' + (width/10) + 'rem)';
      }
    }
    if (type == 'map') {
      let map_container = document.querySelector('.map');
      map_container.style.zIndex = 9999;
      if (!cls_controller.includes('-l')) {
        // card.style.width = (card.offsetWidth - width)/10 + 'rem';
        map_container.style.transform = 'translateX(-' + (width/10) + 'rem)';
      }
    }

    let specific_cls = 'show-context-menu-' + type;
    gtiz_context.body.classList.add('show-context-menu');
    gtiz_context.body.classList.add(specific_cls);
    gtiz_context.body.append(menu_node);

    let menu_node_h = menu_node.offsetHeight;
    let menu_content_h = menu_content.offsetHeight;
    let menu_form = menu_content.querySelector('.card-form');
    let menu_form_top = menu_form.offsetTop;
    if (menu_content_h > menu_node_h) {
      // menu_content.classList.add('card-overflow');
      let height = menu_node_h - 
      parseInt(getComputedStyle(menu_content).paddingTop) -
      parseInt(getComputedStyle(menu_content).paddingBottom) -
      parseInt(getComputedStyle(menu_content).marginTop) -
      parseInt(getComputedStyle(menu_content).marginBottom);
      menu_content.style.height = height/10 + 'rem';
      menu_form.style.height = (menu_content.offsetHeight - menu_form_top)/10 + 'rem';
    }

    setTimeout(() => {
      menu_node.style.opacity = 1;
    }, 0);
  }
}

/**
 * Update context menu position on window resize event
 * 
 * @param {DOM Node} menu Context menu to update
 * @param {String} type Relative card of context menu
 */
gtiz_context.updateContextPosition = function(menu, type) {

  let body_cls = gtiz_context.body.getAttribute('class');
  let component = document.querySelector('.card-' + type);
  let card_context = menu.querySelector('.card-context-menu');
  let card_form = card_context.querySelector('.card-form');
  let card_form_top = card_form.offsetTop;
  let component_style = getComputedStyle(component);
  let menu_h = menu.offsetHeight;
  let card_context_h = card_context.offsetHeight;
  let margin_r = parseInt(component_style.marginRight.replace(/\D/g, ""));
  let width = component.offsetWidth;
  let rect = component.getBoundingClientRect();
  let x = rect.left;
  let y = rect.top;
  let left = x;
  let top = y;
  // update position
  menu.style.left = (left + width + margin_r)/10 + 'rem';
  menu.style.top  = (top)/10 + 'rem';
  if (type == 'legend') {
    let translate = -(width + margin_r)/10 + 'rem';
    component.style.transform = `translateX(${translate})`;
  }
  if (!body_cls.includes('-l')) {
    width = 320;
  } else {
    let legend_width = document.querySelector('.main > .legend').offsetWidth;
    menu.style.width = legend_width/10 + 'rem';
  }
  if (card_context_h > menu_h) {
    let height = menu_h - 
      parseInt(getComputedStyle(card_context).paddingTop) -
      parseInt(getComputedStyle(card_context).paddingBottom) -
      parseInt(getComputedStyle(card_context).marginTop) -
      parseInt(getComputedStyle(card_context).marginBottom);
      card_context.style.height = height/10 + 'rem';
      card_form.style.height = (card_context.offsetHeight - card_form_top)/10 + 'rem';
  } else {
    card_context.removeAttribute('style');
    card_form.removeAttribute('style');
  }
}

gtiz_context.triggers.forEach(function(trigger) {
  trigger.addEventListener('click', function(e) {
    let type = trigger.getAttribute('data-menu-type');
    gtiz_context.showMenu(type, trigger);
  });
});

gtiz_context.graph_div.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  let type = 'tree';
  let trigger = document.querySelector('.card-tree .card-context-menu-trigger');
  gtiz_context.showMenu(type, trigger);
});

gtiz_context.legend_div.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  let type = 'legend';
  let trigger = gtiz_context.legend_div.querySelector('.card-context-menu-trigger');
  gtiz_context.showMenu(type, trigger);
});

gtiz_context.metadata_div.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  let type = 'metadata';
  let trigger = gtiz_context.metadata_div.querySelector('.card-context-menu-trigger');
  gtiz_context.showMenu(type, trigger);
});

gtiz_context.map_div.addEventListener("contextmenu", (e) => {
  let cls = gtiz_context.map_div.getAttribute('class');
  if (cls.includes('map-initialized')) {
    e.preventDefault();
    let type = 'map';
    let trigger = gtiz_context.map_div.querySelector('.card-context-menu-trigger');
    gtiz_context.showMenu(type, trigger);
  }
});

window.addEventListener("resize", function() {
  let menu = document.querySelector('.context-menu');
  if (menu) {
    let cls = menu.getAttribute('class');
    let type;
    gtiz_context.menus.forEach(menu => {
      if (cls.includes(menu)) {
        type = menu;
      }
    });
    if (type) {
      setTimeout(() => {
        gtiz_context.updateContextPosition(menu, type);   
      }, 100);
    }
  }
});