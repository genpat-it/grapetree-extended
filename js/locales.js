let gtiz_locales = {};

gtiz_locales.user_lang = undefined;

gtiz_locales.languages = [{
  code : 'en',
  description : 'English',
  active : true
}, {
  code : 'it',
  description : 'Italiano',
  active : false
}];

gtiz_locales.current = {};

gtiz_locales.body = document.querySelector('body');
gtiz_locales.change_language_label = document.querySelector('.tool-lang .tool-label');
gtiz_locales.change_language_trigger = document.querySelector('.tool-lang .tool-trigger');
gtiz_locales.close_modal_trigger = document.querySelector('.modal-close');

gtiz_locales.getActiveLanguageTerms = function() {
  let languages = gtiz_locales.languages;
  let language = languages.find(element => element.active);
  let code = language ? language.code : 'en';
  let terms = { ...gtiz_languages[code]};
  Object.keys(terms).forEach(key => {
    terms[key] = terms[key];
  });
  return terms;
}

/**
 * Translate page UI with gtiz_locales terms
 * 
 * @param {DOM Node} container A DOM node containing elements to translate
 */
gtiz_locales.translate = function (container) {
  let languages = gtiz_locales.languages;
  let language = languages.find(element => element.active);
  let code = language ? language.code : 'en';
  let terms = gtiz_languages[code];
  gtiz_locales.change_language_label.innerHTML = code;
  let nodes = !container ? document.querySelectorAll('[data-i18n-key]') : container.querySelectorAll('[data-i18n-key]');
  if (nodes && nodes.length > 0) {
    nodes.forEach(element => {
      let key = element.getAttribute("data-i18n-key");
      let translation = key ? terms[key] : undefined;
      if (translation) {
        if (element.hasAttribute('placeholder')) {
          element.setAttribute('placeholder', translation);
        } else {
          element.innerHTML = translation;
        }
      }
    });
  }
}

gtiz_locales.setLanguagesCfg = function(lang) {
  let languages = gtiz_locales.languages;
  languages.forEach(obj => {
    if (lang.includes(obj.code)) {
      obj.active = true;
    } else {
      obj.active = false;
    }
  });
}

gtiz_locales.setLanguage = function(lang) {
  gtiz_locales.setLanguagesCfg(lang);
  gtiz_locales.translate();
}

gtiz_locales.changeLanguage = function(lang) {
  if (lang && !gtiz_locales.user_lang.includes(lang)) {
    let url = new URL(window.location.href);
    let params = new URLSearchParams(url.search);
    params.set('lang', lang);
    window.location.href = '?' + params.toString();
  }
}

/**
 * 
 * Build modal
 * 
 */
gtiz_locales.buildChangeLanguageModal = function() {
  let languages = gtiz_locales.languages;
  let language = languages.find(element => element.active);
  let code = language ? language.code : 'en';
  let modal = document.querySelector('.modal');
  let m_header = modal.querySelector('.modal-header');
  m_header.innerHTML = '<h3>' + gtiz_languages[code].change_language + '</h3>';
  let m_body = modal.querySelector('.modal-body');
  // Build language selector
  let select_box = document.createElement('div');
  select_box.setAttribute('class', 'select-box');
  let label = document.createElement('div');
  label.setAttribute('class', 'form-label');
  label.innerHTML = '<i class="iconic iconic-globe"></i>' + gtiz_languages[code].select_language;
  select_box.append(label);
  let select = document.createElement('select');
  let option = document.createElement('option');
  option.setAttribute('value', '');
  option.innerHTML = gtiz_languages[code].select_language;
  select.append(option);
  languages.forEach(element => {
    let option = document.createElement('option');
    option.setAttribute('value', element.code);
    option.innerHTML = element.description;
    select.append(option);
  });
  select.addEventListener('change', function(event) {
    let lang = event.target.value;
    if (lang != '') {
      gtiz_locales.changeLanguage(lang);
    }
  });
  select_box.append(select);
  m_body.appendChild(select_box);
  let m_feedback = modal.querySelector('.modal-feedback');
  m_feedback.classList.add('info');
  m_feedback.classList.add('show');
  m_feedback.innerHTML = gtiz_languages[code].change_language_alert;
};

gtiz_locales.change_language_trigger.addEventListener('click', function(e) {
  gtiz_locales.buildChangeLanguageModal();
  gtiz_locales.body.classList.add('show-modal');
 });

gtiz_locales.init = function() {
  if (!gtiz_locales.user_lang) {
    let params = new URLSearchParams(document.location.search);
    let lang = params.get('lang');
    if (lang) {
      gtiz_locales.user_lang = lang;
    } else {
      let nav_lang = navigator.language || navigator.userLanguage;
      gtiz_locales.user_lang = nav_lang ? nav_lang : 'en-EN';
    }
    gtiz_locales.setLanguage(gtiz_locales.user_lang);
    gtiz_locales.current = gtiz_locales.getActiveLanguageTerms();
  }
}

gtiz_locales.init();