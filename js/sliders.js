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
  gap: 22,
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
  gap: 22,
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
  gap: 22,
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
