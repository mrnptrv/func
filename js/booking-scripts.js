'use strict';

////// СЛАЙДЕР //////

// Слайдер №1

// const spaceSlider1 = new Glide('#space-slider-1', {
//   type: 'slider',
//   rewind: true
// });
//
// spaceSlider1.on(['mount.after', 'run'], () => {
//   let index = spaceSlider1.index;
//   const slider = document.querySelector('#space-slider-1');
//   const slides = slider.querySelectorAll('.space__slide');
//   const leftArrow = slider.querySelector('.slider-control--left');
//   const rightArrow = slider.querySelector('.slider-control--right');
//
//   slider.querySelector('.slider-footer__index').innerHTML = index + 1;
//   slider.querySelector('.slider-footer__total').innerHTML = slides.length;
// });
//
// spaceSlider1.mount();

// Слайдер №2

// const spaceSlider2 = new Glide('#space-slider-2', {
//   type: 'slider',
//   rewind: true
// });
//
// spaceSlider2.on(['mount.after', 'run'], () => {
//   let index = spaceSlider2.index;
//   const slider = document.querySelector('#space-slider-2');
//   const slides = slider.querySelectorAll('.space__slide');
//   const leftArrow = slider.querySelector('.slider-control--left');
//   const rightArrow = slider.querySelector('.slider-control--right');
//
//   slider.querySelector('.slider-footer__index').innerHTML = index + 1;
//   slider.querySelector('.slider-footer__total').innerHTML = slides.length;
// });
//
// spaceSlider2.mount();

// Хэндлим модалки

// const backdrop = document.querySelector('.popup__backdrop');
// const popupApply = document.querySelector('.popup');
// const popupApplyClose = document.querySelector('#apply-close');
// const popupApplyCancel = document.querySelector('#apply-cancel');
// const popupApplySubmit = document.querySelector('#apply-submit');
// const popupApplyName = document.querySelector('#apply-name');
// const popupApplyPhone = document.querySelector('#apply-phone');
// const popupApplyTerms = document.querySelector('#apply-accept-terms');
//
// const userAgent = navigator.userAgent;
// const iOS = /iPad|iPhone|iPod/.test(userAgent);
// const iOS11 = /OS 11_0|OS 11_1|OS 11_2/.test(userAgent);
// const android = /Android/.test(userAgent);
// const applyFormCloseElements = [backdrop, popupApplyClose, popupApplyCancel];
//
// const openForm = (form) => {
//   document.body.classList.add('no-scroll');
//   document.querySelector('html').classList.add('no-scroll');
//   form.classList.add('popup--shown');
//
//   if (iOS && iOS11) {
//     document.body.classList.add('no-scroll-ios');
//   }
//
//   if (android) {
//     popupApply.querySelectorAll('.popup__input').forEach((item) => {
//       item.addEventListener('focus', () => {
//         setTimeout(() => {
//           item.scrollIntoView({
//             behavior: 'smooth'
//           });
//         }, 200);
//       });
//     });
//   }
//
//   popupApplyName.focus();
//   popupApplyPhone.value = '+7 (';
//
//   popupApplyTerms.addEventListener('change', () => {
//     if (popupApplyTerms.checked) {
//       popupApplySubmit.disabled = false;
//     } else {
//       popupApplySubmit.disabled = true;
//     }
//   });
// };
//
// const closeForm = (form) => {
//   document.body.classList.remove('no-scroll');
//   document.body.classList.remove('no-scroll-ios');
//   document.querySelector('html').classList.remove('no-scroll');
//   form.classList.remove('popup--shown');
//   document.removeEventListener('keyup', closeFormOnEscape);
// };
//
// const closeFormOnEscape = (event) => {
//   if (event.keyCode === 27) {
//     closeForm(popupApply);
//   }
// };
//
// document.querySelectorAll('.apply-button').forEach((item) => {
//   item.addEventListener('click', () => {
//     openForm(popupApply);
//
//     if (item.dataset.goal === 'try') {
//       document.querySelector('.popup__headline').innerText = 'Запишись на экскурсию';
//       document.querySelector('.popup__info').hidden = true;
//     } else if (item.dataset.goal === 'demo') {
//       document.querySelector('.popup__headline').innerText = 'Запишись на демо-день';
//       document.querySelector('.popup__info').hidden = true;
//     } else {
//       document.querySelector('.popup__headline').innerText =  'Оставь заявку';
//       document.querySelector('.popup__info').hidden = false;
//     }
//
//     applyFormCloseElements.forEach((item) => {
//       item.addEventListener('click', () => {
//         closeForm(popupApply);
//       });
//     });
//
//     document.addEventListener('keyup', closeFormOnEscape);
//   });
// });

// Пишем, какой на дворе год

window.addEventListener('DOMContentLoaded', () => {
  const date = new Date();
  document.querySelector('#current-year').innerText = date.getFullYear();
});

// Добавляем ховер эффект на меню

const navLinks = document.querySelectorAll('.nav__link');

navLinks.forEach((item) => {
  item.addEventListener('mouseover', () => {
    navLinks.forEach((item) => {
      item.style.opacity = '0.5';
    });
    item.style.opacity = '1';
  });

  item.addEventListener('mouseout', () => {
    navLinks.forEach((item) => {
      item.style.opacity = '1';
    });
  });
});

// Хэндлим мобильное меню

const topBar = document.querySelector('.nav');

document.querySelector('.nav__burger').addEventListener('click', (event) => {
  topBar.classList.toggle('nav--open-menu');
});

document.querySelectorAll('.nav__item').forEach((item) => {
  item.addEventListener('click', () => {
    topBar.classList.remove('nav--open-menu');
  });
});

// Назначаем кнопку для скроллирования

document.querySelector('.footer__up').addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
});

// Заставляем аккордеоны работать

document.querySelectorAll('.space__button').forEach((item) => {
  item.addEventListener('click', (event) => {
    event.target.parentNode.classList.toggle('space__accordion--closed');
  });
});

// Украшаем номер телефона в форме

// popupApplyPhone.addEventListener('input', (event) => {
//   let popupApplyPhoneInput = [];
//   let formattedPopupApplyPhoneInput = '+';
//
//   if (event.inputType !== 'deleteContentBackward') {
//     popupApplyPhoneInput = popupApplyPhone.value.replace(/[^0-9]/g, '').split('');
//
//     if (popupApplyPhone.value.length > 2) {
//       popupApplyPhoneInput.splice(1, 0, ' (');
//     }
//     if (popupApplyPhone.value.length > 6) {
//       popupApplyPhoneInput.splice(5, 0, ') ');
//     }
//     if (popupApplyPhone.value.length > 11) {
//       popupApplyPhoneInput.splice(9, 0, '-');
//     }
//     if (popupApplyPhone.value.length > 14) {
//       popupApplyPhoneInput.splice(12, 0, '-');
//     }
//
//     popupApplyPhoneInput.forEach((item) => {
//       formattedPopupApplyPhoneInput += item;
//     });
//
//     popupApplyPhone.value = formattedPopupApplyPhoneInput;
//   } else {
//     if (popupApplyPhone.value.length === 16) {
//       popupApplyPhone.value = popupApplyPhone.value.substring(0, 15);
//     }
//     if (popupApplyPhone.value.length === 13) {
//       popupApplyPhone.value = popupApplyPhone.value.substring(0, 12);
//     }
//     if (popupApplyPhone.value.length === 9) {
//       popupApplyPhone.value = popupApplyPhone.value.substring(0, 7);
//     }
//     if (popupApplyPhone.value.length === 4) {
//       popupApplyPhone.value = popupApplyPhone.value.substring(0, 2);
//     }
//   }
// });

// Меняем информацию о выбранном времени в попапе

// const popupApplyTimeInput = document.querySelector('#popup-time');
// const popupApplyHoursInput = document.querySelector('#popup-hours');
//
// const formatTime = (time) => {
//   let formattedTime = '';
//   if (time.length === 1) {
//     formattedTime = '0' + time + ':00';
//   } else if (time.length === 2) {
//     formattedTime = time + ':00';
//   } else {
//     formattedTime = '';
//   }
//
//   return formattedTime;
// };
//
// const countHoursSelected = () => {
//   const endOfBooking = parseInt(popupApplyTimeInput.value) + parseInt(popupApplyHoursInput.value);
//   if (endOfBooking < 24) {
//     return formatTime(popupApplyTimeInput.value) + ' \u2013 ' + formatTime(endOfBooking.toString());
//   } else if (endOfBooking === 24) {
//     return formatTime(popupApplyTimeInput.value) + ' \u2013 00:00';
//   } else {
//     return 'с ' + formatTime(popupApplyTimeInput.value);
//   }
// };
//
// [popupApplyTimeInput, popupApplyHoursInput].forEach((item) => {
//   item.addEventListener('input', () => {
//     if (popupApplyHoursInput.value > 0) {
//       document.querySelector('#popup-selected-time').innerText = countHoursSelected();
//     } else {
//       document.querySelector('#popup-selected-time').innerText = '...';
//     }
//   });
// });
//
// document.querySelector('#popup-date').addEventListener('pickmeup-change', (event) => {
//   document.querySelector('#popup-selected-date').innerText = event.detail.formatted_date;
// });

// Управляем количеством часов

// document.querySelector('.popup__juk--minus').addEventListener('click', () => {
//   if (popupApplyHoursInput.value > 1) {
//     popupApplyHoursInput.value--;
//     document.querySelector('#popup-selected-time').innerText = countHoursSelected();
//   }
// });
//
// document.querySelector('.popup__juk--plus').addEventListener('click', () => {
//   popupApplyHoursInput.value++;
//   document.querySelector('#popup-selected-time').innerText = countHoursSelected();
// });
