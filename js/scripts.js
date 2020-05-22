'use strict';

////// СЛАЙДЕР //////

// Логика для назначения неактивной кнопки-стрелки

const assignDisabledArrowButton = (slider, slidesAmount, leftArrow, rightArrow) => {
  if (slider.index === 0) {
    leftArrow.disabled = true;
  } else {
    leftArrow.disabled = false;
  }

  if (slider.index === (slidesAmount - 1)) {
    rightArrow.disabled = true;
  } else {
    rightArrow.disabled = false;
  }
}

// Слайдер в разделе "Пространства"

const roomsSlider = new Glide('.rooms__slider', {
  type: 'slider',
  rewind: false,
  peek: {
    before: 0,
    after: 100
  },
  gap: 24,
  breakpoints: {
    666: {
      peek: 0
    }
  }
});

roomsSlider.on(['mount.after', 'run'], () => {
  let index = roomsSlider.index;
  const slider = document.querySelector('.rooms__slider');
  const slides = document.querySelectorAll('.rooms__slide');
  const caption = slides[index].querySelector('img').alt;
  const leftArrow = slider.querySelector('.slider-control--left');
  const rightArrow = slider.querySelector('.slider-control--right');

  document.querySelector('#rooms-slider-index').innerHTML = index + 1;
  document.querySelector('#rooms-slider-total').innerHTML = slides.length;
  document.querySelector('.rooms__caption').innerHTML = caption;

  assignDisabledArrowButton(roomsSlider, slides.length, leftArrow, rightArrow);
});

roomsSlider.mount();

// Слайдер в разделе "ИТ-тусовки"

const organizeSlider = new Glide('.organize__slider', {
  type: 'slider',
  rewind: true
});

organizeSlider.on(['mount.after', 'run'], () => {
  let index = organizeSlider.index;
  const slider = document.querySelector('.organize__slider');
  const slides = document.querySelectorAll('.organize__gallery-item');
  const leftArrow = slider.querySelector('.slider-control--left');
  const rightArrow = slider.querySelector('.slider-control--right');

  document.querySelector('#organize-slider-index').innerHTML = index + 1;
  document.querySelector('#organize-slider-total').innerHTML = slides.length;

  assignDisabledArrowButton(organizeSlider, slides.length, leftArrow, rightArrow);
});

organizeSlider.mount();

// Слайдер в разделе "Отзывы"

const feedbackSlider = new Glide('.feedback__slider', {
  type: 'slider',
  rewind: false,
  perView: 1,
  gap: 24,
  peek: {
    before: 0,
    after: 200
  },
  breakpoints: {
    959: {
      gap: 0,
      peek: 0
    }
  }
});

feedbackSlider.on(['mount.after', 'run'], () => {
  let index = feedbackSlider.index;
  const slider = document.querySelector('.feedback__slider');
  const slides = document.querySelectorAll('.feedback__item');
  const leftArrow = slider.querySelector('.slider-control--left');
  const rightArrow = slider.querySelector('.slider-control--right');

  document.querySelector('#feedback-slider-index').innerHTML = index + 1;
  document.querySelector('#feedback-slider-total').innerHTML = slides.length;

  assignDisabledArrowButton(feedbackSlider, slides.length, leftArrow, rightArrow);
});

feedbackSlider.mount();

////// ЯНДЕКС.КАРТА //////

// Вставляем Яндекс.Карту

ymaps.ready(init);

function init() {
    const myMap = new ymaps.Map('map', {
        center: [56.844870, 53.182412],
        zoom: 16,
        controls: [],
        type: 'yandex#satellite'
    }),

    FuncIconContentLayout = ymaps.templateLayoutFactory.createClass(
        '<button class="unbutton">$[properties.iconContent]</button>'
    ),

    funcPlacemark = new ymaps.Placemark(myMap.getCenter(), {
        hintContent: 'Коворкинг Fun(c)'
    }, {
        iconLayout: 'default#image',
        iconImageHref: 'img/icon-map-pin.svg',
        iconImageSize: [30, 41],
        iconImageOffset: [-15, -39]
    }),

    ZoomLayout = ymaps.templateLayoutFactory.createClass('<p class="map__buttons">' +
        '<button class="map__button map__button--plus circle-button unbutton" type="button" id="zoom-in">+</button>' +
        '<button class="map__button map__button--minus circle-button unbutton" type="button" id="zoom-out">&dash;</button>' +
        '</ul>', {

        build: function () {
            ZoomLayout.superclass.build.call(this);

            this.zoomInCallback = ymaps.util.bind(this.zoomIn, this);
            this.zoomOutCallback = ymaps.util.bind(this.zoomOut, this);

            document.querySelector('#zoom-in').addEventListener('click', this.zoomInCallback);
            document.querySelector('#zoom-out').addEventListener('click', this.zoomOutCallback);
        },

        clear: function () {
            document.querySelector('#zoom-in').removeEventListener('click', this.zoomInCallback);
            document.querySelector('#zoom-out').removeEventListener('click', this.zoomOutCallback);

            ZoomLayout.superclass.clear.call(this);
        },

        zoomIn: function () {
            const map = this.getData().control.getMap();
            map.setZoom(map.getZoom() + 1, {checkZoomRange: true});
        },

        zoomOut: function () {
            const map = this.getData().control.getMap();
            map.setZoom(map.getZoom() - 1, {checkZoomRange: true});
        }
    }),

    zoomControl = new ymaps.control.ZoomControl({
      options: {
        layout: ZoomLayout,
        position: {
          bottom: '58px',
          right: '30px'
        }
      }
    });

    myMap.controls.add(zoomControl);

    myMap.controls.add('routeButtonControl', {
      position: {
        top: '58px',
        left: '30px'
      }
    });

    myMap.controls.get('routeButtonControl').routePanel.state.set('to', 'Ижевск, проезд Дерябина, 3/4');

    var placemark = new ymaps.Placemark([56.844870, 53.182412]);

    myMap.geoObjects.add(funcPlacemark);
    myMap.behaviors.disable('scrollZoom');
}

////// ПРОЧЕЕ //////

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

document.querySelector('.nav__burger').addEventListener('click', (event) => {
  document.querySelector('.nav').classList.toggle('nav--open-menu');
});

document.querySelectorAll('.nav__item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelector('.nav').classList.remove('nav--open-menu');
  });
});

// Назначаем кнопки для скроллирования

document.querySelector('.contacts__down').addEventListener('click', () => {
  document.querySelector('.intro').scrollIntoView({
    behavior: 'smooth'
  })
});

document.querySelector('.footer__up').addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
});

// Добавляем эффект наведения на категории

const categories = document.querySelectorAll('.amenities__category');
const amenities = document.querySelectorAll('.amenities__item');

categories.forEach((item) => {
  item.addEventListener('mouseover', (event) => {
    const filteredAmenities = Array.from(amenities).filter(item => item.dataset.category.includes(event.target.dataset.id));

    categories.forEach((item) => {
      item.style.opacity = '0.5';
    });

    item.style.opacity = '1';

    filteredAmenities.map(item => item.classList.add('amenities__item--highlighted'));

    event.target.addEventListener('mouseout', () => {
      categories.forEach((item) => {
        item.style.opacity = '1';
      });

      filteredAmenities.map(item => item.classList.remove('amenities__item--highlighted'));
    });
  });
});

// Показываем больше/меньше плюшек

const showMoreAmenitiesButton = document.querySelector('.amenities__show-more');

showMoreAmenitiesButton.addEventListener('click', (event) => {
  event.target.parentNode.classList.toggle('amenities--full');

  event.target.blur();

  if (document.querySelector('.amenities--full')) {
    showMoreAmenitiesButton.querySelector('span').innerText = 'Скрыть';
  } else {
    showMoreAmenitiesButton.querySelector('span').innerText = 'Показать ещё';
  }
});

// Хэндлим модалки

const backdrop = document.querySelector('.popup__backdrop');
const popupApply = document.querySelector('.popup');
const popupApplyClose = document.querySelector('#apply-close');
const popupApplyCancel = document.querySelector('#apply-cancel');
const popupApplySubmit = document.querySelector('#apply-submit');
const popupApplyName = document.querySelector('#apply-name');
const popupApplyPhone = document.querySelector('#apply-phone');
const popupApplyTerms = document.querySelector('#apply-accept-terms')

const applyFormCloseElements = [backdrop, popupApplyClose, popupApplyCancel];

const openForm = form => {
  document.body.classList.add('no-scroll');
  document.querySelector('html').classList.add('no-scroll');
  form.classList.add('popup--shown');

  popupApplyName.focus();
  popupApplyPhone.value = '+7 (';

  popupApplyTerms.addEventListener('change', () => {
    if (popupApplyTerms.checked) {
      popupApplySubmit.disabled = false;
    } else {
      popupApplySubmit.disabled = true;
    }
  });
};

const closeForm = form => {
  document.body.classList.remove('no-scroll');
  document.querySelector('html').classList.remove('no-scroll');
  form.classList.remove('popup--shown');
};

document.querySelectorAll('.apply-button').forEach((item) => {
  item.addEventListener('click', () => {
    openForm(popupApply);

    if (item.dataset.goal === 'try') {
      document.querySelector('.popup__headline').innerText = 'Запишись на экскурсию';
    } else {
      document.querySelector('.popup__headline').innerText = 'Оставь заявку';
    }

    applyFormCloseElements.forEach((item) => {
      item.addEventListener('click', () => {
        closeForm(popupApply);
      });
    });
  });
});

// Приклеиваем меню

const topBar = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 100) {
    topBar.classList.add('nav--sticky');
  } else {
    topBar.classList.remove('nav--sticky');
  }
});

// Украшаем номер телефона в форме

popupApplyPhone.addEventListener('input', (event) => {
  let popupApplyPhoneInput = [];
  let formattedPopupApplyPhoneInput = '+';

  if (event.inputType !== 'deleteContentBackward') {
    popupApplyPhoneInput = popupApplyPhone.value.replace(/[^0-9]/g, '').split('');

    if (popupApplyPhone.value.length > 2) {
      popupApplyPhoneInput.splice(1, 0, ' (');
    }
    if (popupApplyPhone.value.length > 6) {
      popupApplyPhoneInput.splice(5, 0, ') ');
    }
    if (popupApplyPhone.value.length > 11) {
      popupApplyPhoneInput.splice(9, 0, '-');
    }
    if (popupApplyPhone.value.length > 14) {
      popupApplyPhoneInput.splice(12, 0, '-');
    }

    popupApplyPhoneInput.forEach((item) => {
      formattedPopupApplyPhoneInput += item;
    });

    popupApplyPhone.value = formattedPopupApplyPhoneInput;
  } else {
    if (popupApplyPhone.value.length === 16) {
      popupApplyPhone.value = popupApplyPhone.value.substring(0, 15);
    }
    if (popupApplyPhone.value.length === 13) {
      popupApplyPhone.value = popupApplyPhone.value.substring(0, 12);
    }
    if (popupApplyPhone.value.length === 9) {
      popupApplyPhone.value = popupApplyPhone.value.substring(0, 7);
    }
    if (popupApplyPhone.value.length === 4) {
      popupApplyPhone.value = popupApplyPhone.value.substring(0, 2);
    }
  }
});
