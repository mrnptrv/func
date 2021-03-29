// Хэндлим модалки

const backdrop = document.querySelector('.popup__backdrop');
const popupApply = document.querySelector('.popup');
const popupApplyClose = document.querySelector('#apply-close');
const popupApplyCancel = document.querySelector('#apply-cancel');
const popupApplySubmit = document.querySelector('#apply-submit');
const popupApplyName = document.querySelector('#apply-name');
const popupApplyPhone = document.querySelector('#apply-phone');
const popupApplyTerms = document.querySelector('#apply-accept-terms');

const userAgent = navigator.userAgent;
const iOS = /iPad|iPhone|iPod/.test(userAgent);
const iOS11 = /OS 11_0|OS 11_1|OS 11_2/.test(userAgent);
const android = /Android/.test(userAgent);

const applyFormCloseElements = [backdrop, popupApplyClose, popupApplyCancel];

const openForm = form => {
    document.body.classList.add('no-scroll');
    document.querySelector('html').classList.add('no-scroll');
    form.classList.add('popup--shown');

    window.location.hash = 'zapolnenie-formy';

    if (iOS && iOS11) {
        document.body.classList.add('no-scroll-ios');
    }

    if (android) {
        popupApply.querySelectorAll('.popup__input').forEach((item) => {
            item.addEventListener('focus', () => {
                setTimeout(() => {
                    item.scrollIntoView({
                        behavior: 'smooth'
                    });
                }, 200);
            });
        });
    }

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
    document.body.classList.remove('no-scroll-ios');
    document.querySelector('html').classList.remove('no-scroll');
    form.classList.remove('popup--shown');
    form.classList.remove('popup--location');
    document.removeEventListener('keyup', closeFormOnEscape);
    window.location.hash = '';
};

const closeFormOnEscape = event => {
    if (event.keyCode === 27) {
        closeForm(popupApply);
    }
};

document.querySelectorAll('.apply-button').forEach((item) => {
    item.addEventListener('click', () => {
        openForm(popupApply);

        document.querySelector('#apply-goal').value = 'general';
        document.querySelector('.popup__subtitle').innerText = ' ';
        if (item.dataset.goal === 'try') {
            document.querySelector('.popup__headline').innerText = 'Запишись на экскурсию';
            document.querySelector('.popup').classList.add('popup--location');
        } else if (item.dataset.goal === 'demo') {
            document.querySelector('.popup__headline').innerText = 'Запишись на демо-день';
            document.querySelector('.popup__subtitle').innerText = 'стоимость демо-дня 100 руб';
            document.querySelector('#apply-goal').value = 'demo';
        } else {
            document.querySelector('.popup__headline').innerText =  'Оставь заявку';
        }

        applyFormCloseElements.forEach((item) => {
            item.addEventListener('click', () => {
                closeForm(popupApply);
            });
        });

        document.addEventListener('keyup', closeFormOnEscape);
    });
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

//<!-- Закрываем форму после успешной отправки данных -->
const form = document.querySelector('#apply-form');
const checkThankYouMessage = () => {
    if (document.querySelector('.pageclip-form__success')) {
        window.location.hash = 'spasibo';
        clearInterval(checkEveryMoment);
    }
};
const checkEveryMoment = setInterval(checkThankYouMessage, 100);

Pageclip.form(form, {
    onSubmit: function (event) {
        if (document.querySelector('.pageclip-form__success')) {
            window.location.hash = 'spasibo';
        }
        setTimeout(() => {
            document.querySelector('.pageclip-form__success').style.display = 'none';
            closeForm(popupApply);
        }, 5000);
    },
    successTemplate: '<span>Спасибо! <br>Совсем скоро мы свяжемся с тобой.</span>'
});
