ymaps.ready(init);

function init() {
    const myMap = new ymaps.Map('map', {
            center: [55.7881624, 49.1146236],
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
            right: '30px'
        }
    });

    myMap.controls.get('routeButtonControl').routePanel.state.set('to', 'Казань, улица Островского, 27');

    const placemark = new ymaps.Placemark([55.7881624, 49.1146236]);

    myMap.geoObjects.add(funcPlacemark);
    myMap.behaviors.disable('scrollZoom');
}
