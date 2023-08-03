let gtiz_slider = {};

gtiz_slider.slider_handlers = document.querySelectorAll('.slider-handler');
gtiz_slider.current_slider_handler;

gtiz_slider.is_dragging = false;
gtiz_slider.drag_initial_position = 0;
gtiz_slider.previous_position = null;
gtiz_slider.computed_position = 0;
gtiz_slider.min = 0;
gtiz_slider.max = 10000;
gtiz_slider.direction = 'forward';

gtiz_slider.getEventPosition = function(event) {
  if (event.touches) {
    return event.touches[0].clientX;
  } else {
    return event.clientX;
  }
}

gtiz_slider.checkDirection = function(current) {
  if (gtiz_slider.previous_position !== null) {
    if (current > gtiz_slider.previous_position) {
      // Variable is increasing
      gtiz_slider.direction = 'forward';
    } else if (current < gtiz_slider.previous_position) {
      // Variable is decreasing
      gtiz_slider.direction = 'backward';
    }
  }
  gtiz_slider.previous_position = current;
}

gtiz_slider.handleDragStart = function(event, slider, bar) {
  gtiz_slider.is_dragging = true;
  gtiz_slider.current_slider_handler = slider;
  gtiz_slider.drag_initial_position = gtiz_slider.getEventPosition(event);
  let style = window.getComputedStyle(slider);
  gtiz_slider.computed_position = parseFloat(style.getPropertyValue('left'));
  slider.style.transitionDuration = '0s';
  // Calculate the min and max positions within the bar
  gtiz_slider.min = 0;
  gtiz_slider.max = bar.clientWidth - slider.offsetWidth;
};

gtiz_slider.handleDragMove = function(event, slider, bar) {
  let current_position = gtiz_slider.getEventPosition(event);
  let distance = current_position - gtiz_slider.drag_initial_position + gtiz_slider.computed_position;
  // Restrict the slider's position within the min and max positions
  let restricted_position = Math.max(gtiz_slider.min, Math.min(gtiz_slider.max, distance));
  gtiz_slider.checkDirection(restricted_position);
  // Update the slider's position
  slider.style.left = restricted_position + 'px';
};

gtiz_slider.handleDragEnd = function(event, slider) {
  if (gtiz_slider.is_dragging) {
    // upgrade seconds to restart play from where slider is
    let style = window.getComputedStyle(slider);
    let position = parseInt(style.getPropertyValue('left'));
    let max = gtiz_slider.max;
    gtiz_slider.position_result = position;
    gtiz_slider.is_dragging = false;
  }
};

gtiz_slider.slider_handlers.forEach(handler => {
  let bar = handler.previousElementSibling;
  handler.addEventListener('mousedown', e => {
    gtiz_slider.handleDragStart(e, handler, bar);
  });
  handler.addEventListener('touchstart', e => {
    gtiz_slider.handleDragStart(e, handler, bar);
  });
});

document.addEventListener('mousemove', e => {
  if (!gtiz_slider.is_dragging) return;
  let handler = gtiz_slider.current_slider_handler;
  let bar = handler ? handler.previousSibling : undefined;
  gtiz_slider.handleDragMove(e, handler, bar);
});
document.addEventListener('touchmove', e => {
  if (!gtiz_slider.is_dragging) return;
  let handler = gtiz_slider.current_slider_handler;
  let bar = handler ? handler.previousSibling : undefined;
  gtiz_slider.handleDragMove(e, handler, bar);
});

document.addEventListener('mouseup', e => {
  let handler = gtiz_slider.current_slider_handler;
  gtiz_slider.handleDragEnd(e, handler);
});
document.addEventListener('touchend', e => {
  let handler = gtiz_slider.current_slider_handler;
  gtiz_slider.handleDragEnd(e, handler);
});