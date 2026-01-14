// __mocks__/swiper/react.js
const React = require('react');

/**
 * Список пропсов, специфичных для Swiper, которые не должны передаваться в DOM
 */
const SWIPER_PROPS = [
    'initialSlide',
    'spaceBetween',
    'freeMode',
    'slidesPerView',
    'modules',
    'pagination',
    'navigation',
    'scrollbar',
    'autoplay',
    'loop',
    'centeredSlides',
    'grabCursor',
    'breakpoints',
    'onSwiper',
    'onSlideChange',
    'onReachEnd',
    'onReachBeginning',
    'direction',
    'effect',
    'speed',
    'thumbs',
    'zoom',
    'virtual',
    'watchOverflow',
    'watchSlidesProgress',
    'allowTouchMove',
    'simulateTouch',
    'touchRatio',
    'touchAngle',
    'shortSwipes',
    'longSwipes',
    'followFinger',
    'threshold',
    'resistance',
    'resistanceRatio',
];

/**
 * Фильтрует пропсы Swiper, оставляя только валидные DOM-атрибуты
 */
const filterSwiperProps = (props) => {
    const filtered = {};
    Object.keys(props).forEach((key) => {
        if (!SWIPER_PROPS.includes(key) && !key.startsWith('on') || key === 'onClick' || key === 'onKeyDown') {
            filtered[key] = props[key];
        }
    });
    return filtered;
};

const Swiper = ({ children, ...props }) => {
    const filteredProps = filterSwiperProps(props);
    return React.createElement('div', { 'data-testid': 'swiper-mock', ...filteredProps }, children);
};

const SwiperSlide = ({ children, ...props }) => {
    const filteredProps = filterSwiperProps(props);
    return React.createElement('div', { 'data-testid': 'swiper-slide-mock', ...filteredProps }, children);
};

const useSwiper = () => ({
    slideNext: () => {},
    slidePrev: () => {},
    slideTo: () => {},
    activeIndex: 0,
});

module.exports = {
    Swiper,
    SwiperSlide,
    useSwiper,
};
