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
    'slidesOffsetAfter',
    'slidesOffsetBefore',
    'cssMode',
    'observer',
    'observeParents',
    'keyboard',
    'mousewheel',
    'lazy',
    'preloadImages',
    'a11y',
    'history',
    'hashNavigation',
    'controller',
    'coverflowEffect',
    'flipEffect',
    'creativeEffect',
    'fadeEffect',
    'cubeEffect',
    'cardsEffect',
    'grid',
    'parallax',
    'edgeSwipeDetection',
    'edgeSwipeThreshold',
    'preventClicks',
    'preventClicksPropagation',
    'slideToClickedSlide',
    'touchEventsTarget',
    'touchReleaseOnEdges',
    'noSwiping',
    'noSwipingClass',
    'noSwipingSelector',
    'passiveListeners',
    'nested',
    'enabled',
    'autoHeight',
    'slidesPerGroup',
    'slidesPerGroupSkip',
    'rewind',
    'roundLengths',
    'loopedSlides',
    'loopAdditionalSlides',
    'width',
    'height',
    'runCallbacksOnInit',
    'init',
    'onInit',
    'onBeforeInit',
    'onAfterInit',
    'onDestroy',
    'onUpdate',
    'onResize',
    'onProgress',
    'onSetTranslate',
    'onSetTransition',
    'onSlideChangeTransitionStart',
    'onSlideChangeTransitionEnd',
    'onTransitionStart',
    'onTransitionEnd',
    'onTouchStart',
    'onTouchMove',
    'onTouchEnd',
    'onClick',
    'onTap',
    'onDoubleTap',
    'onImagesReady',
    'onLock',
    'onUnlock',
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
    return React.createElement('div', { 'data-testid': 'swiper', ...filteredProps }, children);
};

const SwiperSlide = ({ children, ...props }) => {
    const filteredProps = filterSwiperProps(props);
    return React.createElement('div', { 'data-testid': 'swiper-slide', ...filteredProps }, children);
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
