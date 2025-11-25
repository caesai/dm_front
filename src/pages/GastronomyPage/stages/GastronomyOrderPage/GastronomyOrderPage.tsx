import css from './GastronomyOrderPage.module.css'
import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IOrder } from '@/types/gastronomy.types.ts';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { MiniCrossIcon } from '@/components/Icons/MiniCrossIcon.tsx';
import { MONTHS_LONG2, weekdaysMap } from '@/utils.ts';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import moment from 'moment';

export const GastronomyOrderPage: React.FC = () => {
    const location = useLocation()
    const navigate = useNavigate();
    const order: IOrder = location.state?.order

    const time = useMemo(() => {
        return order.deliveryTime ? order.deliveryTime : order.pickupTime
    }, [location.state, order]);

    const goBack = () => {
        navigate(-1);
    }

    const getDateWithMonth = (date: string) => {
        const currentDate = moment(date).format('DD')
        const currentMonth = MONTHS_LONG2[Number(moment(date).format('MM'))-1]
        return `${currentDate} ${currentMonth}`
    }

    const getDayOfWeek = (date: string) => {
        const dayIndex = new Date(date).getDay();
        return weekdaysMap[dayIndex];
    }

    useEffect(() => {
        if (!order) {
            goBack()
        }
    }, [location.state, order]);
    return (
        <section className={css.page}>
            <div className={css.header}>
                <span className={css.spacer}></span>
                <span className={css.header_title}>Заказ {order.orderId}</span>
                <RoundedButton
                    bgColor={'var(--secondary-background)'}
                    icon={<MiniCrossIcon color={'var(--dark-grey)'} />}
                    action={goBack}
                />
            </div>
            <div className={css.content}>
                <span className={css.content_title}>Ваш заказ успешно оплачен!</span>
                <div className={css.items}>
                    {order.items.map(item => (
                        <div className={css.item} key={item.id}>
                            <span>{item.title}</span>
                            <span>{item.quantity} × {item.price} ₽</span>
                        </div>
                    ))}
                </div>
                <div className={css.item}>
                    <span>Итого</span>
                    <span>{order.totalAmount} ₽</span>
                </div>
                <div className={css.info}>
                    <div className={css.info_content}>
                        <span>Способ получения</span>
                        <span>{order.deliveryMethod === 'delivery' ? 'Доставка' : 'Самовывоз'}, {order.deliveryAddress}</span>
                    </div>
                    {time && (
                        <div className={css.info_content}>
                            <span>Дата и время</span>
                            <span>{getDayOfWeek(time.date)}, {getDateWithMonth(time.date)}, {time.time}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className={css.bottom_buttons}>
                <UniversalButton width={'full'} title={'Отменить заказ'} />
                <UniversalButton width={'full'} title={'Задать вопрос по заказу'} theme={'red'} />
            </div>
        </section>
    )
}