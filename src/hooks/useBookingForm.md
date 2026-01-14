# useBookingForm

Комплексный хук для управления формой бронирования столиков в ресторане.

## Обзор

Хук `useBookingForm` инкапсулирует всю логику формы бронирования:
- Управление состоянием формы через Jotai atoms
- Валидация полей формы
- API-запросы для загрузки доступных дат и временных слотов
- Обработка сертификатов
- Создание бронирования

## Использование

### Общая страница бронирования (BookingPage)

Пользователь сам выбирает ресторан из списка:

```typescript
import { useBookingForm } from '@/hooks/useBookingForm';

const BookingPage = () => {
    const { form, handlers, createBooking } = useBookingForm({
        certificateParams: {
            certificate: state?.certificate,
            certificateId: state?.certificateId,
        },
    });
    
    return (
        // ...
    );
};
```

### Бронирование конкретного ресторана (RestaurantBookingPage)

Пользователь переходит со страницы ресторана:

```typescript
const RestaurantBookingPage = () => {
    const { form, handlers, createBooking } = useBookingForm({
        preSelectedRestaurant: {
            id: String(currentRestaurant.id),
            title: currentRestaurant.title,
            address: currentRestaurant.address,
        },
        initialBookingData: {
            bookedDate: state.bookedDate,
            bookedTime: state.bookedTime,
            guestCount: 1,
            childrenCount: 0,
        },
        isSharedRestaurant: state?.sharedRestaurant,
    });
    
    return (
        // ...
    );
};
```

### Бронирование на мероприятие (EventBookingPage)

Ресторан и дата берутся из данных мероприятия:

```typescript
const EventBookingPage = () => {
    const { form, handlers, createBooking, isEventBooking } = useBookingForm({
        eventData: {
            id: selectedEvent.id,
            name: selectedEvent.name,
            dateStart: selectedEvent.date_start,
            dateEnd: selectedEvent.date_end,
            restaurantId: String(selectedEvent.restaurant.id),
            restaurantTitle: selectedEvent.restaurant.title,
            restaurantAddress: selectedEvent.restaurant.address,
        },
    });
    
    return (
        // ...
    );
};
```

## API

### Параметры (options)

| Параметр | Тип | Описание |
|----------|-----|----------|
| `certificateParams` | `ICertificateClaimParams` | Параметры для активации сертификата |
| `preSelectedRestaurant` | `IPreSelectedRestaurant` | Предвыбранный ресторан |
| `initialBookingData` | `IInitialBookingData` | Начальные данные бронирования |
| `isSharedRestaurant` | `boolean` | Флаг перехода по shared-ссылке |
| `eventData` | `IEventData` | Данные мероприятия |

### Возвращаемые значения

#### Состояние формы

| Свойство | Тип | Описание |
|----------|-----|----------|
| `form` | `IBookingFormState` | Текущее состояние всех полей формы |
| `isFormValid` | `boolean` | Форма полностью валидна |
| `validationDisplay` | `IValidationDisplay` | Состояние валидации для UI |
| `triggerValidation` | `() => boolean` | Функция запуска валидации |

#### Данные из API

| Свойство | Тип | Описание |
|----------|-----|----------|
| `availableDates` | `PickerValue[]` | Доступные даты для бронирования |
| `availableTimeslots` | `ITimeSlot[]` | Доступные временные слоты |
| `canShowTimeSlots` | `boolean` | Можно показывать слоты |

#### Состояния загрузки и ошибок

| Свойство | Тип | Описание |
|----------|-----|----------|
| `loading` | `ILoadingState` | Состояния загрузки (dates, timeslots, submit) |
| `errors` | `IErrorState` | Состояния ошибок |
| `setErrorPopup` | `(popup: boolean) => void` | Управление popup ошибки |

#### Обработчики (handlers)

| Метод | Описание |
|-------|----------|
| `selectRestaurant(restaurant: PickerValue)` | Выбор ресторана |
| `selectDate(date: PickerValue)` | Выбор даты |
| `setGuestCount(value: number | (prev) => number)` | Изменение количества гостей |
| `setChildrenCount(value: number | (prev) => number)` | Изменение количества детей |
| `selectTimeSlot(slot: ITimeSlot | null)` | Выбор временного слота |
| `setConfirmation(value: IConfirmationType)` | Выбор способа подтверждения |
| `updateField(update: Partial<IBookingFormState>)` | Обновление любого поля |

#### Действия

| Метод | Описание |
|-------|----------|
| `createBooking()` | Создание бронирования |

#### Информация о контексте

| Свойство | Тип | Описание |
|----------|-----|----------|
| `preSelectedRestaurant` | `IPreSelectedRestaurant | undefined` | Предвыбранный ресторан |
| `isSharedRestaurant` | `boolean` | Флаг shared-ссылки |
| `isEventBooking` | `boolean` | Это бронирование на мероприятие |
| `eventData` | `IEventData | undefined` | Данные мероприятия |

## Валидация

Хук валидирует следующие поля:

| Поле | Правило валидации |
|------|-------------------|
| `userName` | Не пустое |
| `userPhone` | Соответствует формату российского телефона |
| `date` | Выбрана (не "unset") |
| `selectedTimeSlot` | Выбран |
| `guestCount` | Больше 0 |

### Формат телефона

Поддерживаются форматы:
- `+7XXXXXXXXXX`
- `8XXXXXXXXXX`
- `+7 XXX XXX XX XX`

## Логика работы

### Загрузка данных

1. **Доступные даты** загружаются при выборе ресторана
2. **Временные слоты** загружаются при:
   - Выбранном ресторане
   - Выбранной дате
   - Количестве гостей > 0

### Сброс временного слота

Временной слот сбрасывается при:
- Смене ресторана
- Смене даты

### Создание бронирования

При вызове `createBooking()`:

1. Проверка onboarding:
   - Если `user.complete_onboarding === false`, редирект на `/onboarding/3`
   
2. Валидация формы:
   - Если невалидна, показываются ошибки на 5 секунд
   
3. Отправка API-запроса:
   - При успехе: навигация на `/myBookings/{id}` или `/tickets/{ticket_id}` (для events)
   - При ошибке: показывается popup

## Интерфейсы

### IBookingFormState

```typescript
interface IBookingFormState {
    restaurant: PickerValue;
    date: PickerValue;
    selectedTimeSlot: ITimeSlot | null;
    guestCount: number;
    childrenCount: number;
    userName: string;
    userPhone: string;
    userEmail: string;
    commentary: string;
    confirmation: IConfirmationType;
    preOrder: boolean;
    certificateId: string | null;
}
```

### IValidationDisplay

```typescript
interface IValidationDisplay {
    nameValid: boolean;
    phoneValid: boolean;
    dateValid: boolean;
    timeSlotValid: boolean;
    guestsValid: boolean;
}
```

### ILoadingState

```typescript
interface ILoadingState {
    timeslots: boolean;
    dates: boolean;
    submit: boolean;
}
```

### IErrorState

```typescript
interface IErrorState {
    timeslots: boolean;
    popup: boolean;
    botError: boolean;
    popupCount: number;
}
```

## Тестирование

Тесты находятся в `src/__tests__/useBookingForm.test.tsx`.

Покрытие:
- ✅ Инициализация формы с данными пользователя
- ✅ Инициализация с preSelectedRestaurant
- ✅ Инициализация с eventData
- ✅ Инициализация с initialBookingData
- ✅ Валидация полей
- ✅ Обработчики формы
- ✅ canShowTimeSlots
- ✅ Загрузка данных из API
- ✅ Создание бронирования
- ✅ Редирект на онбординг
- ✅ Согласованность с компонентами страниц

## Связанные компоненты

- [BookingPage](../pages/BookingPage/BookingPage.tsx)
- [RestaurantBookingPage](../pages/BookingPage/RestaurantBookingPage.tsx)
- [EventBookingPage](../pages/BookingPage/EventBookingPage.tsx)
- [bookingFormAtom](../atoms/bookingFormAtom.ts)
