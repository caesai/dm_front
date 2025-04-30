import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Calendar from 'react-calendar';
import { useEffect, useMemo, useState } from 'react';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';
import {
    findCurrentDate,
    formatDateCalendar,
    IEventBookingContext,
} from '@/utils.ts';
import { ArrowLeft, ArrowRight } from 'react-iconly';
import css from './DTSelectionOutlet.module.css';
import classNames from 'classnames';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import moment from 'moment';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { ITimeSlot } from '@/pages/BookingPage/BookingPage.types.ts';
import { APIGetAvailableEventTimeslots } from '@/api/events.ts';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/userAtom.ts';
import { eventsListAtom, guestCountAtom } from '@/atoms/eventBookingAtom.ts';
import { PlaceholderBlock } from '@/components/PlaceholderBlock/PlaceholderBlock.tsx';
import { IEvent } from '@/pages/EventsPage/EventsPage.tsx';

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const createDateForCalendar = (dt: string) => {
    const date = new Date(dt);
    date.setHours(0, 0, 0, 0);
    return date;
};
export const DTSelectionOutlet = () => {
    const { name, res } = useParams();
    const navigate = useNavigate();
    const [auth] = useAtom(authAtom);

    // Это value календаря - текущая выбранная дата в календаре.
    const [value, onChange] = useState<Value>();
    const [bookingInfo, setBookingInfo] =
        useOutletContext<IEventBookingContext>();
    const [availableDates, setAvailableDates] = useState<Date[]>([]);
    const [restaurantTimeslots, setRestaurantTimeslots] = useState<ITimeSlot[]>(
        []
    );
    const [timeslotsLoading, setTimeslotsLoading] = useState(false);
    const [currentSelectedTime, setCurrentSelectedTime] = useState<ITimeSlot>();
    const [guestCount, setGuestCount] = useAtom(guestCountAtom);
    const [events] = useAtom<IEvent[]>(eventsListAtom);

    const incCounter = () => {
        setGuestCount((prev: number) => (prev < 9 ? prev + 1 : prev));
    };
    const decCounter = () => {
        setGuestCount((prev: number) => (prev - 1 >= 1 ? prev - 1 : prev));
    };

    useEffect(() => {
        if (!bookingInfo.event) {
            const ev = events.find((e) => e.name == name);
            if (ev) {
                setBookingInfo((prevState) => ({ ...prevState, event: ev }));
            }
        }
        if (!bookingInfo.restaurant) {
            const rest = events
                .find((e) => e.name == name)
                ?.restaurants.find((r) => r.id == Number(res));
            if (rest) {
                setBookingInfo((prevState) => ({
                    ...prevState,
                    restaurant: rest,
                }));
            }
        }
    }, [name, res, events]);

    useEffect(() => {
        const eventId = bookingInfo.event?.restaurants
            .find((f) => f.id === Number(res))
            ?.dates.find((d) => {
                if (value) {
                    return (
                        createDateForCalendar(
                            d.date_start
                        ).toLocaleDateString() ==
                        new Date(value.toString()).toLocaleDateString()
                    );
                }
            })?.id;
        if (!auth?.access_token || !eventId || !bookingInfo.restaurant?.id) {
            return;
        }
        setTimeslotsLoading(true);
        APIGetAvailableEventTimeslots(
            eventId,
            bookingInfo.restaurant?.id,
            guestCount,
            auth.access_token
        )
            .then((res) => setRestaurantTimeslots(res.data))
            .finally(() => setTimeslotsLoading(false));
    }, [value, guestCount]);

    useEffect(() => {
        if (bookingInfo.event) {
            const dates = bookingInfo.event?.restaurants
                .find((f) => f.id === Number(res))
                ?.dates.map((date) => createDateForCalendar(date.date_start));
            if (dates) {
                setAvailableDates(dates);
            }
        }
    }, [bookingInfo.event]);

    const isValid = useMemo(() => {
        console.log(bookingInfo);
        return (
            value &&
            currentSelectedTime &&
            bookingInfo.event &&
            bookingInfo.restaurant
        );
    }, [value, currentSelectedTime]);

    const setTime = (time: ITimeSlot) => {
        setBookingInfo((prev) => ({ ...prev, date: time }));
        setCurrentSelectedTime(time);
    };

    useEffect(() => {
        if (!currentSelectedTime) {
            return;
        }
        setBookingInfo((prev) => ({
            ...prev,
            event_date: findCurrentDate(bookingInfo, currentSelectedTime),
        }));
    }, [currentSelectedTime]);

    const next = () => {
        isValid ? navigate(`/events/${name}/restaurant/${res}/guests`) : null;
    };

    return (
        <div className={css.frame}>
            <div className={css.personsContainer}>
                <span className={css.personsContainer__title}>
                    Количество мест
                </span>
                <div className={css.personCounter}>
                    <span className={css.clickableSpan} onClick={incCounter}>
                        +
                    </span>
                    <span>{guestCount}</span>
                    <span className={css.clickableSpan} onClick={decCounter}>
                        -
                    </span>
                </div>
            </div>
            <div className={css.calendar}>
                <Calendar
                    onChange={onChange}
                    allowPartialRange={false}
                    selectRange={false}
                    value={value}
                    tileDisabled={({ date }) =>
                        !availableDates.some(
                            (d) => d.getTime() == date.getTime()
                        )
                    }
                    showDoubleView={false}
                    formatMonthYear={(_, date) => formatDateCalendar(date)}
                    prev2Label={null}
                    next2Label={null}
                    maxDetail={'month'}
                    minDetail={'month'}
                    prevLabel={<ArrowLeft />}
                    nextLabel={<ArrowRight />}
                />
            </div>
            {value ? (
                <div className={css.timeOfDayContainer}>
                    <div className={css.timeList}>
                        <Swiper
                            slidesPerView="auto"
                            modules={[FreeMode]}
                            freeMode={true}
                            spaceBetween={8}
                            style={{
                                marginLeft: '0',
                            }}
                        >
                            {!timeslotsLoading
                                ? restaurantTimeslots.map((v) => (
                                      <SwiperSlide
                                          key={`time_${v.start_datetime}`}
                                          style={{
                                              width: 'max-content',
                                          }}
                                      >
                                          <div
                                              className={classNames(
                                                  css.timeList_button,
                                                  currentSelectedTime === v
                                                      ? css.timeList_button__active
                                                      : null
                                              )}
                                              onClick={() => setTime(v)}
                                          >
                                              <span>
                                                  {moment(
                                                      v.start_datetime
                                                  ).format('HH:mm')}
                                              </span>
                                          </div>
                                      </SwiperSlide>
                                  ))
                                : Array(3)
                                      .fill(0)
                                      .map((_, i) => (
                                          <SwiperSlide
                                              key={`timeslot_ph_${i}`}
                                              style={{
                                                  width: 'max-content',
                                              }}
                                          >
                                              <PlaceholderBlock
                                                  width={'100px'}
                                                  height={'45px'}
                                                  rounded={'20px'}
                                              />
                                          </SwiperSlide>
                                      ))}
                        </Swiper>
                    </div>
                    {!timeslotsLoading && !restaurantTimeslots.length ? (
                        <span>Нет доступных столиков</span>
                    ) : null}
                </div>
            ) : null}
            <div className={css.absoluteBottom}>
                <div className={css.bottomWrapper}>
                    <UniversalButton
                        width={'full'}
                        title={'Купить билет'}
                        theme={isValid ? 'red' : undefined}
                        action={() => {
                            isValid
                                ? next()
                                : alert(
                                      'Для продолжения выберите доступную дату и время из списка.'
                                  );
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
