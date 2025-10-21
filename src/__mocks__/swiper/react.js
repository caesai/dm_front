// __mocks__/swiper/react.js
import React from 'react';
export const Swiper = ({ children, ...props }) => <div {...props}>{children}</div>;
export const SwiperSlide = ({ children, ...props }) => <div {...props}>{children}</div>;
export const useSwiper = () => ({});
