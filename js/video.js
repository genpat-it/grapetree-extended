let gtiz_video = {};

gtiz_video.cfg = {
  speeds : [{
    value : 0.5,
    label : '0.5x',
    active: false
  }, {
    value : 1,
    label : '1x',
    active: true
  }, {
    value : 1.5,
    label : '1.5x',
    active: false
  }, {
    value : 2,
    label : '2x',
    active: false
  }, {
    value : 5,
    label : '5x',
    active: false
  }],
  tolerance : 18,
  timing: 0,
  status : 'init'
};

gtiz_video.timer;
gtiz_video.seconds = 0;
gtiz_video.play_trigger = document.querySelector('.play-trigger');
gtiz_video.slider_handler = document.querySelector('.slider-box-player .slider-handler');
gtiz_video.slider_previous_position = null;
gtiz_video.slider_position = 0;
gtiz_video.slider_direction = 'forward';
gtiz_video.slider_frames = [];

gtiz_video.resetScrollPosition = function() {
  let container = document.querySelector('.card-legend .card-form');
  setTimeout(() => {
    container.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, gtiz_video.cfg.timing);
}

gtiz_video.scrollToPosition = function(position) {
  let container = document.querySelector('.card-legend .card-form');
  let delta = container.offsetHeight / 2;
  setTimeout(() => {
    if (position > delta) {
      container.scrollTo({
        top: position - delta,
        behavior: 'smooth'
      });
    } else {
      container.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, gtiz_video.cfg.timing);
}

/**
 * Function used to calculate the direction of the slider, current position will be compared with a previous position stored in a variable.
 * 
 * @param {Number} current Current position of the slider
 */
gtiz_video.setSliderDirection = function(current) {
  if (gtiz_video.slider_previous_position !== null) {
    if (current > gtiz_video.slider_previous_position) {
      // Variable is increasing
      gtiz_video.slider_direction = 'forward';
    } else if (current < gtiz_video.slider_previous_position) {
      // Variable is decreasing
      gtiz_video.slider_direction = 'backward';
    }
  }
  gtiz_video.slider_previous_position = current;
}

/**
 * Legend items selection
 * 
 * @param {Number} index Index of the item to be selected
 * @param {String} direction  Calculated value indicating the direction of the slider
 */
gtiz_video.legendSetSelection = function(index, direction) {
  let item_nodes = document.querySelectorAll('.card-legend .list-row');
  let items = Array.from(item_nodes);
  let sliced;
  if (direction == 'forward') {
    sliced = items.slice(0, index + 1);
  } else {
    sliced = items.slice(index);
  }
  if (sliced) {
    sliced.forEach((el, i) => {
      let check = el.querySelector('.list-check');
      let icon = check.querySelector('i');
      if (direction == 'forward') {
        icon.setAttribute('class', 'iconic iconic-check-circle');
        el.classList.add('selected');
      } else {
        icon.setAttribute('class', 'iconic iconic-check-circle-empty');
        el.classList.remove('selected');
      }
      if ((direction === 'forward' && i === index) || (direction !== 'forward' && i === 0)) {
        let el_top = el.offsetTop;
        gtiz_video.scrollToPosition(el_top);
      }
    });
    let selection_mode = gtiz_legend.selection_mode;
    if (selection_mode == 'qualitative') {
      gtiz_legend.nodeSelection();
    } else {
      gtiz_legend.highlightSelection();
    }
  }
}

/**
 * Calculate frames array based on bar widht and itmes number. This should be called on play or on start dragging.
 * 
 */
gtiz_video.calculateSliderFrames = function() {
  let items = document.querySelectorAll('.card-legend .list-row');
  let items_n = items.length;
  let slider = gtiz_video.slider_handler;
  let bar = slider ? slider.previousElementSibling : undefined;
  let max = bar.clientWidth - slider.offsetWidth + 1;
  let unit = max / items_n;
  gtiz_video.slider_frames = [];
  items.forEach((item, i) => {
    gtiz_video.slider_frames.push(unit * (i + 1));
  });
};

/**
 * Mutation handler, effectively perform the legend selection based on the position of the slider in relation with step calculeted from the items number and the width of the slider bar.
 * 
 * @param {Object} mutation Mutation observed
 */
gtiz_video.handleMutation = function(mutation) {
  // Check if the slider is within range of any desired position
  let slider = mutation.target;
  let bar = slider ? slider.previousElementSibling : undefined;
  let max = bar.clientWidth - slider.offsetWidth + 1;
  let tolerance = gtiz_video.cfg.tolerance; // Define the range (+/-) around each desired position
  let style = getComputedStyle(slider);
  let position = parseInt(style.getPropertyValue('left'));
  gtiz_video.setSliderDirection(position);
  let direction = gtiz_video.slider_direction ? gtiz_video.slider_direction : 'forward';
  let speed = gtiz_video.cfg.speeds.find(el => el.active);
  let items = document.querySelectorAll('.card-legend .list-row');
  let items_n = items.length;
  let duration = items_n / speed.value;
  gtiz_video.seconds = (duration * position) / max;
  gtiz_video.slider_position = position;  
  gtiz_video.slider_frames.forEach((frame, i) => {
    tolerance = frame/2 > tolerance ? tolerance : frame/2;
    if (position >= frame - tolerance && position <= frame + tolerance) {
      gtiz_video.legendSetSelection(i, direction);
    }
  });
}

/**
 * Callback function to launch on DOM node under observation
 * 
 * @param {Object} mutationList List of mutations
 * @param {*} observer 
 */
gtiz_video.observerCallback = (mutationList, observer) => {
  for (let mutation of mutationList) {
    if (mutation.type === "attributes") {
      gtiz_video.handleMutation(mutation);
    }
  }
};
gtiz_video.observer = new MutationObserver(gtiz_video.observerCallback);

/**
 * Observer initialization of the video slider, the observer is used to trigger effectively legend selection based on the position of the slider.
 * 
 */
gtiz_video.initObserver = function() {
  let config = { attributes: true, childList: true, subtree: true };
  gtiz_video.observer.observe(gtiz_video.slider_handler, config);
}

/**
 * Actions to hold end of the playing. 
 */
gtiz_video.endPlayer = function() {
  let speed_selector = document.querySelector('.slider-box-player select');
  speed_selector.removeAttribute('disabled');
  let btn = gtiz_video.play_trigger;
  let icon = btn.querySelector('i');
  icon.setAttribute('class', 'iconic iconic-refresh');
  gtiz_video.cfg.status = 'finished';
}

/**
 * Cleare interval to pause player.
 * 
 */
gtiz_video.pausePlayer = function() {
  clearInterval(gtiz_video.timer);
}

/**
 * Start interval holding the player.
 * 
 * @param {Number} duration The duration interval should have based on the number of legend items and speed value `itmesNumber/speedValue`
 */
gtiz_video.startPlayer = function(duration) {
  let slider = gtiz_video.slider_handler;
  let bar = slider ? slider.previousElementSibling : undefined;
  let max = bar.clientWidth - slider.offsetWidth + 1;
  let timing = (duration * 1000)/max;
  gtiz_video.cfg.timing = timing;
  gtiz_video.timer = setInterval(function() {
    if (gtiz_video.slider_position < max) {
      gtiz_video.slider_position += 1;
      slider.style.left = gtiz_video.slider_position + 'px';
    } else {
      clearInterval(gtiz_video.timer);
      gtiz_video.endPlayer();
    }
  }, timing);
}

/**
 * Change UI of the play button of the video player
 * 
 * @param {Node} btn Button to change
 * @param {String} cls Class used to determine button icon
 */
gtiz_video.changePlayBtnUI = function(btn, cls) {
  if (!btn) {
    btn = gtiz_video.play_trigger;
  }
  btn.classList.toggle('play');
  btn.classList.toggle('pause');
  let icon = btn.querySelector('i');
  let icon_cls = 'iconic iconic-' + cls;
  icon.setAttribute('class', icon_cls);
}

/**
 * Reset video player
 * 
 * @param {Object} e Event generated by the listener
 * @param {String} status Current status of the video player `init`, `playing`, `pause`, `finished`.
 */
gtiz_video.reset = function(e) {
  gtiz_video.observer.disconnect();
  let btn = e ? e.currentTarget : gtiz_video.play_trigger;
  gtiz_video.slider_handler.style.transitionDuration = '0.3s';
  gtiz_video.slider_handler.style.left = '0%';
  btn.classList.remove('pause');
  btn.classList.add('play');
  let icon = btn.querySelector('i');
  icon.setAttribute('class', 'iconic iconic-play');
  gtiz_video.slider_position = 0;
  gtiz_video.cfg.status = 'init';
  gtiz_video.cfg.timing = 0;
  gtiz_video.initObserver();
}

/**
 * Pause video player
 * 
 * @param {Object} e Event generated by the listener
 */
gtiz_video.pause = function(e) {
  let btn = e ? e.currentTarget : gtiz_video.play_trigger;
  let cls = 'play';
  gtiz_video.changePlayBtnUI(btn, cls);
  let speed_selector = document.querySelector('.slider-box-player select');
  speed_selector.removeAttribute('disabled');
  gtiz_video.cfg.status = 'pause';
  gtiz_video.cfg.timing = 0;
  gtiz_video.pausePlayer();
}

/**
 * Play video player
 * 
 * @param {Object} e Event generated by the listener
 * @param {String} status Current status of the video player `init`, `playing`, `pause`, `finished`.
 */
gtiz_video.play = function(e, status) {
  let btn = e.currentTarget;
  if (status == 'init') {
    gtiz_legend.unselectAll();
    gtiz_video.slider_position = 0;
    gtiz_video.resetScrollPosition();
  }
  let speed_selector = document.querySelector('.slider-box-player select');
  speed_selector.setAttribute('disabled', true);
  let cls = 'pause';
  gtiz_video.changePlayBtnUI(btn, cls);
  let items = document.querySelectorAll('.card-legend .list-row');
  let items_n = items.length;
  let speed = gtiz_video.cfg.speeds.find(el => el.active);
  let duration = items_n / speed.value;
  gtiz_video.calculateSliderFrames();
  gtiz_video.slider_handler.style.transitionDuration = '0s';
  gtiz_video.startPlayer(duration);
  gtiz_video.cfg.status = 'playing';
}

/**
 * Set the selector for the speed player should play based on a configuration object. 
 * 
 */
gtiz_context.setSpeedSelector = function() {
  let select = document.querySelector('.slider-box-player select');
  select.innerHTML = '';
  gtiz_video.cfg.speeds.forEach(speed => {
    let option = document.createElement('option');
    option.setAttribute('value', speed.value);
    option.innerHTML = speed.label;
    select.append(option);
    if (speed.active) {
      select.value = speed.value;
    }
  });
  select.addEventListener('change', e => {
    gtiz_video.cfg.speeds.forEach(speed => {
      if (speed.value == select.value) {
        speed.active = true;
      } else {
        speed.active = false;
      }
    });
  });
}

gtiz_video.slider_handler.addEventListener('mousedown', e => {
  gtiz_video.calculateSliderFrames();
  if (gtiz_video.cfg.status == 'playing' || gtiz_video.cfg.status == 'init' || gtiz_video.cfg.status == 'finished') {
    if (gtiz_video.cfg.status == 'init') {
      gtiz_legend.unselectAll();
      gtiz_video.resetScrollPosition();
    }
    gtiz_video.pause();
  }
});

gtiz_video.play_trigger.addEventListener('click', e => {
  let status = gtiz_video.cfg.status;
  switch (status) {
    case 'init':
    case 'pause':
    case 'manual':
      gtiz_video.play(e, status);
      break;
    case 'playing':
      gtiz_video.pause(e);
      break;
    case 'finished':
      gtiz_video.reset(e);
      break;
    default:
      console.log('Oops! Status undefined.');
  }
});

gtiz_video.init = function() {
  gtiz_context.setSpeedSelector();
  gtiz_video.initObserver();
}