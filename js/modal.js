let gtiz_modal = {};

gtiz_modal.body = document.querySelector('body');
gtiz_modal.close_modal_trigger = document.querySelector('.modal-close');

/**
 * 
 * Colse modal and clean contents
 * 
 */
gtiz_modal.closeModal = function () {
  gtiz_locales.body.classList.toggle("show-modal");
  let modal = document.querySelector('.modal');
  modal.setAttribute('class', 'modal');
  let m_header = document.querySelector('.modal-header');
  let m_body = document.querySelector('.modal-body');
  let m_feedback = document.querySelector('.modal-feedback');
  m_feedback.setAttribute('class', 'modal-feedback');
  m_header.innerHTML = "";
  m_body.innerHTML = "";
  m_feedback.innerHTML = "";
}

gtiz_modal.close_modal_trigger.addEventListener('click', function(e) {
  gtiz_modal.closeModal();
});