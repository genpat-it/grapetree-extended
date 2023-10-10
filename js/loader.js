let gtiz_loader = {};

/**
 * 
 * Build loader utility
 * 
 * @returns loader
 * 
 */
gtiz_loader.getLoader = function () {
  let loader = document.createElement('div');
  loader.setAttribute('class', 'lds-ring gtiz-loader');
  loader.innerHTML = '<div></div><div></div><div></div><div></div>';
  return loader;
}

/**
 * 
 * Add loader utility
 * 
 */
gtiz_loader.addLoader = function (container) {
  let loader = gtiz_loader.getLoader();
  let exist = container ? container.querySelector('.gtiz-loader') : false;
  if (!exist) {
    container.append(loader);
  }
}

/**
 * 
 * Remove loader utility
 * 
 */
gtiz_loader.removeLoader = function(parent) {
  let parent_dom = parent;
  let loaders = parent_dom ? parent_dom.querySelectorAll('.gtiz-loader') : document.querySelectorAll('.gtiz-loader');
  if (loaders) {
    loaders.forEach(loader => {
      loader.remove();
    });
  }
}