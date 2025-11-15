import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { IWorkTime } from '@/types/restaurant.ts';
import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { useAtom } from 'jotai/index';
import { guestCountAtom } from '@/atoms/bookingInfoAtom.ts';
import moment from 'moment/moment';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { DateListSelector } from '@/components/DateListSelector/DateListSelector.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import css from '@/pages/Restaurant/Restaurant.module.css';
import { RestaurantNavigation } from '@/components/RestaurantNavigation/RestaurantNavigation.tsx';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
import { Calendar } from 'react-iconly';
import { formatDateAlt, getTimeShort } from '@/utils.ts';
import { FaAngleRight } from 'react-icons/fa';
import classNames from 'classnames';

interface BookingBlockProps {
    currentSelectedTime: ITimeSlot | null;
    workTime: IWorkTime[] | undefined;
    bookingDate: PickerValueObj;
    bookingDates: PickerValueObj[];
    setBookingDate: Dispatch<SetStateAction<PickerValueObj>>;
    timeslotLoading: boolean;
    availableTimeslots: ITimeSlot[];
    setCurrentSelectedTime: (currentSelectedTime: ITimeSlot) => void;
    // TODO: Refactor this booleans
    isShow: boolean;
    isEvents: boolean;
    isNavigationLoading: boolean;
}

export const BookingBlock: React.FC<BookingBlockProps> = ({
    currentSelectedTime,
    workTime,
    bookingDate,
    setBookingDate,
    bookingDates,
    timeslotLoading,
    availableTimeslots,
    setCurrentSelectedTime,
    isShow,
    isEvents,
    isNavigationLoading,
}) => {
    const [, setGuestCount] = useAtom(guestCountAtom);
    const [bookingDatePopup, setBookingDatePopup] = useState<boolean>(false);
    const restaurantWorkEndTime =
        workTime && workTime.find((item) => String(item.weekday) === String(bookingDate.title).slice(-2))?.time_end;
    let workEndTime = moment(bookingDate.value);
    if (restaurantWorkEndTime !== undefined) {
        const endOfDay = Number(String(restaurantWorkEndTime).split(':')[0].replace(new RegExp('00', 'g'), '0')) < 12;
        if (endOfDay) {
            workEndTime = moment(workEndTime.clone().add(1, 'days').startOf('days').format('YYYY-MM-DD'));
        }
        workEndTime.set({
            hour: Number(String(restaurantWorkEndTime).split(':')[0].replace(new RegExp('00', 'g'), '0')),
            minutes: Number(String(restaurantWorkEndTime).split(':')[1].replace(new RegExp('00', 'g'), '0')),
        });
    }

    return (
        <ContentContainer>
            <DateListSelector
                isOpen={bookingDatePopup}
                setOpen={setBookingDatePopup}
                date={bookingDate}
                setDate={setBookingDate}
                values={bookingDates}
            />
            <ContentBlock id={'booking'}>
                <div className={css.navSliderAndBookingContainer}>
                    <RestaurantNavigation isLoading={isNavigationLoading} isShow={isShow} isEvents={isEvents} />
                    <div className={css.bookingContaner}>
                        <Swiper
                            slidesPerView={'auto'}
                            spaceBetween={8}
                            freeMode={true}
                            modules={[FreeMode]}
                            style={{
                                marginLeft: '0',
                            }}
                        >
                            {bookingDate.value == 'unset' || !bookingDates.length ? (
                                <SwiperSlide style={{ width: 'min-content' }}>
                                    <PlaceholderBlock width={'150px'} height={'41px'} rounded={'20px'} />
                                </SwiperSlide>
                            ) : (
                                <SwiperSlide style={{ width: 'min-content' }} onClick={() => setBookingDatePopup(true)}>
                                    <div className={css.timeItem}>
                                        <Calendar size={18} />
                                        {formatDateAlt(bookingDate.value)}
                                        <FaAngleRight size={16} />
                                    </div>
                                </SwiperSlide>
                            )}
                            {timeslotLoading ? (
                                <>
                                    <SwiperSlide style={{ width: 'min-content' }}>
                                        <PlaceholderBlock width={'68px'} height={'41px'} rounded={'20px'} />
                                    </SwiperSlide>
                                    <SwiperSlide style={{ width: 'min-content' }}>
                                        <PlaceholderBlock width={'68px'} height={'41px'} rounded={'20px'} />
                                    </SwiperSlide>
                                    <SwiperSlide style={{ width: 'min-content' }}>
                                        <PlaceholderBlock width={'68px'} height={'41px'} rounded={'20px'} />
                                    </SwiperSlide>
                                </>
                            ) : (
                                availableTimeslots.map((ts, i) => (
                                    <SwiperSlide
                                        key={i}
                                        style={{ width: 'min-content' }}
                                        onClick={() => {
                                            setCurrentSelectedTime(ts);
                                            setGuestCount({
                                                title: '1 гость',
                                                value: '1',
                                            });
                                        }}
                                    >
                                        <div
                                            className={classNames(
                                                css.timeItem,
                                                currentSelectedTime == ts ? css.timeItemActive : null
                                            )}
                                        >
                                            {currentSelectedTime == ts
                                                ? `${getTimeShort(ts.start_datetime)} -  ${
                                                    moment(ts.end_datetime).isBefore(workEndTime)
                                                        ? getTimeShort(ts.end_datetime)
                                                        : restaurantWorkEndTime
                                                }`
                                                : getTimeShort(ts.start_datetime)}
                                        </div>
                                    </SwiperSlide>
                                ))
                            )}
                        </Swiper>
                    </div>
                </div>
            </ContentBlock>
        </ContentContainer>
    );
};