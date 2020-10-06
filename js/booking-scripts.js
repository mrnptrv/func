'use strict';

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
