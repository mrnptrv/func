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

// Слайдер в разделе "События"

const eventsSlider = new Glide('.events__slider', {
  type: 'slider',
  rewind: false,
  perView: 2,
  bound: true,
  peek: {
    before: 0,
    after: 120
  },
  gap: 24,
  breakpoints: {
    959: {
      peek: 0
    },
    767: {
      perView: 1,
      peek: {
        before: 0,
        after: 120
      }
    },
    519: {
      perView: 1,
      peek: 0,
      gap: 0
    }
  }
});

eventsSlider.on(['mount.after', 'run'], () => {
  let index = eventsSlider.index;
  const slider = document.querySelector('.events__slider');
  const slides = document.querySelectorAll('.events__slide');
  const leftArrow = slider.querySelector('.slider-control--left');
  const rightArrow = slider.querySelector('.slider-control--right');

  document.querySelector('#events-slider-index').innerHTML = index + 1;
  document.querySelector('#events-slider-total').innerHTML = slides.length;

  assignDisabledArrowButton(eventsSlider, slides.length, leftArrow, rightArrow);
});

eventsSlider.mount();

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
        controls: ['routeButtonControl'],
        type: 'yandex#satellite'
    }),
    ZoomLayout = ymaps.templateLayoutFactory.createClass('<p class="map__buttons">' +
        '<button class="map__button map__button--plus circle-button unbutton" type="button" id="zoom-in">+</button>' +
        '<button class="map__button map__button--minus circle-button unbutton" type="button" id="zoom-out">&dash;</button>' +
        '</ul>', {

        build: function () {
            ZoomLayout.superclass.build.call(this);

            this.zoomInCallback = ymaps.util.bind(this.zoomIn, this);
            this.zoomOutCallback = ymaps.util.bind(this.zoomOut, this);

            $('#zoom-in').bind('click', this.zoomInCallback);
            $('#zoom-out').bind('click', this.zoomOutCallback);
        },

        clear: function () {
            $('#zoom-in').unbind('click', this.zoomInCallback);
            $('#zoom-out').unbind('click', this.zoomOutCallback);

            ZoomLayout.superclass.clear.call(this);
        },

        zoomIn: function () {
            var map = this.getData().control.getMap();
            map.setZoom(map.getZoom() + 1, {checkZoomRange: true});
        },

        zoomOut: function () {
            var map = this.getData().control.getMap();
            map.setZoom(map.getZoom() - 1, {checkZoomRange: true});
        }
    }),

    zoomControl = new ymaps.control.ZoomControl({
      options: {
        layout: ZoomLayout,
        position: {
          bottom: '88px',
          right: '30px'
        }
      }
    });

    // myMap.controls.add(zoomControl);

    myMap.controls.add('zoomControl', {
      size: 'small',
      float: 'none',
      position: {
        bottom: '88px',
        right: '30px'
      }
    });

    myMap.controls.get('routeButtonControl').routePanel.state.set('to', 'Ижевск, проезд Дерябина, 3/4');

    var placemark = new ymaps.Placemark([56.844870, 53.182412]);

    myMap.geoObjects.add(placemark);
    myMap.behaviors.disable('scrollZoom');
}

////// ПРОЧЕЕ //////

// Пишем, какой на дворе год

window.addEventListener('DOMContentLoaded', () => {
  const date = new Date();
  document.querySelector('#current-year').innerText = date.getFullYear();
});

// Хэндлим мобильное меню

document.querySelector('.nav__burger').addEventListener('click', (event) => {
  document.querySelector('.nav__container').classList.toggle('nav__container--open-menu');
});

document.querySelectorAll('.nav__item').forEach((item) => {
  item.addEventListener('click', () => {
    console.log('click menu');
    document.querySelector('.nav__container').classList.remove('nav__container--open-menu');
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

const applyFormCloseElements = [backdrop, popupApplyClose, popupApplyCancel];

const openForm = form => {
  document.body.classList.add('no-scroll');
  form.classList.add('popup--shown');
};

const closeForm = form => {
  document.body.classList.remove('no-scroll');
  form.classList.remove('popup--shown');
};

document.querySelectorAll('.apply-button').forEach((item) => {
  item.addEventListener('click', () => {
    openForm(popupApply);

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
