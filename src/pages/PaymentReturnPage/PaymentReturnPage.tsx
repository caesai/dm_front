import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/userAtom.ts';
import { APIValidatePayment } from '@/api/events.ts';
import {AppLoadingScreen} from "@/components/AppLoadingScreen/AppLoadingScreen.tsx";
import {selectedEventAtom} from "@/atoms/eventBookingAtom.ts";

export const PaymentReturnPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [auth] = useAtom(authAtom);
    const [eventAtom] = useAtom(selectedEventAtom);

    useEffect(() => {
        const id = searchParams.get('id');
        if (!id || !auth?.access_token) {
            navigate('/');
            return;
        }
        APIValidatePayment(Number(id), auth.access_token).then((res) => {
            console.log('res.data: ', res.data);
            res.data.paid ? navigate(`/tickets/${res.data.event_id}`) : res.data.event_id ? navigate('/') : navigate('/?eventId=eventId_' + eventAtom?.id);
                // : res.data.status == 'cancelled'
                //   ? alert(
                //         'При покупке билета произошла ошибка, платеж отменен, денежные средства будут возвращены автоматически.'
                //     )
                //   : res.data.status == 'new'
                //     ? alert('Платеж все еще не обработан.')
                //     : null;
        }).catch((err) => {
            console.log('err on validate payment: ', err);
            navigate('/');
        });
    }, [searchParams]);

    return (
        <AppLoadingScreen />
    );
};
