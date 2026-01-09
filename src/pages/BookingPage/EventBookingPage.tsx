import React, { useMemo, useState } from 'react';
// Components
import { Page } from '@/components/Page.tsx';
// Hooks
import { useNavigationHistory } from '@/hooks/useNavigationHistory.ts';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { eventsListAtom } from '@/atoms/eventListAtom';
import { getServiceFeeData } from '@/mockData';
import { BottomButtonWrapper } from '@/components/BottomButtonWrapper/BottomButtonWrapper';
import { BookingTimeSlotsBlock } from './blocks/BookingTimeSlotsBlock';
import { BookingContactsBlock } from './blocks/BookingContactsBlock';
import { EventBookingHeader } from './blocks/EventBookingHeader';
import { userAtom } from '@/atoms/userAtom';
import { BookingWish } from '@/components/BookingWish/BookingWish';
import { ConfirmationSelect } from '@/components/ConfirmationSelect/ConfirmationSelect';
import { CONFIRMATION_OPTIONS } from '@/atoms/bookingFormAtom';
import { PageContainer } from '@/components/PageContainer/PageContainer';

/**
 * Страница бронирования для бесплатного мероприятия
 * Пользователь попадает сюда со страницы деталей мероприятия
 * @returns {JSX.Element}
 */
export const EventBookingPage: React.FC = (): JSX.Element => {
    const { eventId } = useParams();
    const user = useAtomValue(userAtom);
    const events = useAtomValue(eventsListAtom);

    const selectedEvent = useMemo(() => {
        return events?.find((event) => event.id === Number(eventId));
    }, [events, eventId]);
    const [childrenCount, setChildrenCount] = useState(0);
    const [guestCount, setGuestCount] = useState(0);
    const serviceFeeMessage = useMemo(
        () => getServiceFeeData(String(selectedEvent?.restaurant.id)),
        [selectedEvent?.restaurant.id]
    );
    const { goBack } = useNavigationHistory();

    const handleGoBack = () => {
        goBack();
    };
    const shareEvent = () => {
        console.log('shareEvent');
    };
    const createBooking = () => {
        console.log('createBooking');
    };
    return (
        <Page back={true}>
            <PageContainer>
                <EventBookingHeader
                    eventName={selectedEvent?.name || ''}
                    guestCount={guestCount}
                    childrenCount={childrenCount}
                    setGuestCount={setGuestCount}
                    setChildrenCount={setChildrenCount}
                    serviceFeeMessage={serviceFeeMessage}
                    handleGoBack={handleGoBack}
                    dateStart={selectedEvent?.date_start || ''}
                />

                {/* Время бронирования */}
                <BookingTimeSlotsBlock
                    canShowTimeSlots={true}
                    loading={false}
                    availableTimeslots={[]}
                    selectedTimeSlot={null}
                    selectTimeSlot={() => {}}
                    isError={false}
                />

                {/* Пожелания при бронировании */}
                <BookingWish
                    restaurantId={Number(selectedEvent?.restaurant.id)}
                    guestCount={guestCount}
                    childrenCount={childrenCount}
                    preOrder={false}
                    setPreOrder={() => {}}
                    restaurant={String(selectedEvent?.restaurant.id)}
                    commentary={''}
                    setCommentary={() => {}}
                />

                {/* Контактная информация */}
                <BookingContactsBlock
                    userName={user?.first_name || ''}
                    userPhone={user?.phone_number || ''}
                    updateFieldName={() => {}}
                    updateFieldPhone={() => {}}
                    validationNameValid={true}
                    validationPhoneValid={true}
                />
                {/* Способ подтверждения */}
                <ConfirmationSelect
                    options={CONFIRMATION_OPTIONS}
                    currentValue={CONFIRMATION_OPTIONS[0]}
                    onChange={() => {}}
                />

                <BottomButtonWrapper content="Забронировать стол" onClick={createBooking} />
            </PageContainer>
        </Page>
    );
};
