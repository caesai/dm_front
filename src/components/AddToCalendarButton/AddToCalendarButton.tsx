import React from 'react';
import { createEvent } from 'ics';
import { openLink } from '@telegram-apps/sdk-react';

const AddToCalendarButton: React.FC = () => {
    const handleAddToCalendar = () => {
        const event = {
            start: [2023, 10, 15, 18, 30] as [
                number,
                number,
                number,
                number,
                number,
            ], // Год, Месяц, День, Час, Минута
            duration: { hours: 2 }, // Длительность события
            title: 'Бронирование стола в ресторане',
            description: 'Вы забронировали стол в ресторане на 18:30.',
            location: 'Ресторан "Вкусно и точка", ул. Пушкина, 10',
            url: 'https://ваш-ресторан.рф',
        };

        createEvent(event, (error, value) => {
            if (error) {
                console.error(error);
                return;
            }

            // Создаем Blob и ссылку для скачивания
            const blob = new Blob([value], {
                type: 'text/calendar;charset=utf-8',
            });
            console.log(`blob:${blob}`);
            const url = URL.createObjectURL(blob);

            // Создаем временную ссылку и автоматически нажимаем на нее
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.setAttribute('download', 'event.ics');
            document.body.appendChild(link);
            // link.click();
            openLink(
                `https://storage.yandexcloud.net/vapehookahstatic/event.ics`,
                {
                    tryInstantView: false,
                }
            );

            // Убираем ссылку из DOM
            document.body.removeChild(link);
        });
    };

    return <button onClick={handleAddToCalendar}>Добавить в календарь</button>;
};

export default AddToCalendarButton;
