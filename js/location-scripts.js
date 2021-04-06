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

// Логика для анимации буллетов

const moveBullets = (direction, activeBullet) => {
    const switchingClass = 'glide__bullet--switching';
    const switchingBackClass = 'glide__bullet--switching-back';

    if (direction === '>') {
        activeBullet.classList.add(switchingClass);

        setTimeout(() => {
            activeBullet.classList.remove(switchingClass);
        }, 400);
    } else if (direction === '<') {
        activeBullet.classList.add(switchingBackClass);

        setTimeout(() => {
            activeBullet.classList.remove(switchingBackClass);
        }, 400);
    }
};

// Слайдер в разделе "Пространства"

const roomsSlider = new Glide('.rooms__slider', {
    type: 'slider',
    rewind: false,
    gap: 24,
    breakpoints: {
        767: {
            gap: 12
        }
    }
});

roomsSlider.on(['mount.after', 'run'], () => {
    let index = roomsSlider.index;
    const slider = document.querySelector('.rooms__slider');
    const slides = document.querySelectorAll('.rooms__slide');
    const leftArrow = slider.querySelector('.slider-control--left');
    const rightArrow = slider.querySelector('.slider-control--right');

    assignDisabledArrowButton(roomsSlider, slides.length, leftArrow, rightArrow);

    roomsSlider.on('run.before', move => {
        moveBullets(move.direction, slider.querySelector('.glide__bullet--active'));
    });
});

roomsSlider.mount();

// Слайдер в разделе "События"

const eventsSlider = new Glide('.events__slider', {
    type: 'slider',
    rewind: true,
    bound: true,
    perView: 3,
    gap: 24,
    breakpoints: {
        959: {
            perView: 2
        },
        767: {
            perView: 1,
            gap: 12,
            peek: {
                before: 0,
                after: 0
            }
        }
    }
});

eventsSlider.on(['mount.after', 'run'], () => {
    let index = eventsSlider.index;
    const slider = document.querySelector('.events__slider');
    const slides = document.querySelectorAll('.events__slide');

    eventsSlider.on('run.before', move => {
        moveBullets(move.direction, slider.querySelector('.glide__bullet--active'));
    });
});

eventsSlider.mount();

// Всплывающий слайдер в разделе "События"

document.querySelectorAll('.events__button').forEach((item, index) => {
    const eventCaption = item.parentNode.querySelector('.events__caption-text').innerText;
    const eventPics = document.querySelector('#popup-slider-event-' + (index + 1)).content;
    const popupSlider = document.querySelector('.popup-slider');

    item.addEventListener('click', (event) => {
        const closePopupSlider = () => {
            popupSlider.classList.remove('popup-slider--shown');
            document.querySelector('.popup-slider__list').innerHTML = '';
            document.body.classList.remove('no-scroll');
            document.removeEventListener('keyup', closePopupSliderOnEscape);
        };

        const closePopupSliderOnEscape = event => {
            if (event.keyCode === 27) {
                closePopupSlider();
            }
        };

        popupSlider.classList.add('popup-slider--shown');
        document.querySelector('.popup-slider__headline').innerText = eventCaption;
        document.querySelector('.popup-slider__list').appendChild(eventPics.cloneNode(true));
        document.body.classList.add('no-scroll');

        const eventsPopupSlider = new Glide('.popup-slider__wrapper', {
            type: 'slider',
            rewind: true,
            bound: true,
            perView: 1,
            gap: 24,
            peek: {
                before: 0,
                after: 125
            },
            breakpoints: {
                959: {
                    peek: 0,
                    gap: 0
                }
            }
        });

        eventsPopupSlider.on(['mount.after', 'run'], () => {
            let index = eventsPopupSlider.index;
            const slider = document.querySelector('.popup-slider__wrapper');
            const slides = document.querySelectorAll('.popup-slider__pic');
            const arrows = slider.querySelectorAll('.slider-control');

            document.querySelector('#popup-slider-index').innerHTML = index + 1;
            document.querySelector('#popup-slider-total').innerHTML = slides.length;

            if (slides.length === 1) {
                arrows.forEach((item) => {
                    item.disabled = true;
                });
            } else {
                arrows.forEach((item) => {
                    item.disabled = false;
                });
            }
        });

        eventsPopupSlider.mount();

        document.querySelector('.popup-slider__close').addEventListener('click', () => {
            closePopupSlider();
        });

        document.addEventListener('keyup', closePopupSliderOnEscape);
    });
});

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
            '<button class="map__button map__button--minus circle-button unbutton" type="button" id="zoom-out">–</button>' +
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

// Назначаем кнопки для скроллирования

document.querySelector('.footer__up').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
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

// Хэндлим мобильное меню

document.querySelector('.nav__burger').addEventListener('click', (event) => {
    topBar.classList.toggle('nav--open-menu');
    document.querySelector('html').classList.toggle('no-scroll');
});

document.querySelectorAll('.nav__item').forEach((item) => {
    item.addEventListener('click', () => {
        topBar.classList.remove('nav--open-menu');
    });
});

// Скроллим к секции по клику в меню

const anchorLinks = document.querySelectorAll('.city-nav__link--anchor');

anchorLinks.forEach((item) => {
    item.addEventListener('click', (event) => {
        event.preventDefault();

        const sectionId = item.getAttribute('href');
        const scrollAmount = (window.pageYOffset + document.querySelector(sectionId).getBoundingClientRect().top) - topBar.offsetHeight;

        window.scrollTo({
            top: scrollAmount,
            behavior: 'smooth'
        });
    });
});
