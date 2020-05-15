// Слайдер в разделе "Пространства"

const roomsSlider = new Glide('.rooms__slider', {
  type: 'carousel',
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
  let slides = document.querySelectorAll('.rooms__slide');
  let cloneSlides = document.querySelectorAll('.rooms__slide.glide__slide--clone');
  let caption = slides[index].querySelector('img').alt;

  document.querySelector('#rooms-slider-index').innerHTML = index + 1;
  document.querySelector('#rooms-slider-total').innerHTML = slides.length - cloneSlides.length;
  document.querySelector('.rooms__caption').innerHTML = caption;
});

roomsSlider.mount();

// Слайдер в разделе "События"

const eventsSlider = new Glide('.events__slider', {
  type: 'carousel',
  perView: 2,
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
  let slides = document.querySelectorAll('.events__slide');
  let cloneSlides = document.querySelectorAll('.events__slide.glide__slide--clone');

  document.querySelector('#events-slider-index').innerHTML = index + 1;
  document.querySelector('#events-slider-total').innerHTML = slides.length - cloneSlides.length;
});

eventsSlider.mount();
