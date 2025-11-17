import { APIValidatePayment } from '@/api/events';
import React, { useEffect } from 'react';
import { useNavigate, useParams,
    // useSearchParams
} from 'react-router-dom';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/userAtom.ts';
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';

export const EventPaymentPage: React.FC = () => {
    const { orderId } = useParams();
    // const [params] = useSearchParams();
    const navigate = useNavigate();
    const [auth] = useAtom(authAtom);

    useEffect(() => {
        if (!auth?.access_token || orderId === undefined) {
            return;
        }
        APIValidatePayment(orderId, auth?.access_token)
            .then((res) => {
                    res.data.paid ? navigate(`/tickets/${res.data.event_id}`) : navigate('/events/?paymentError=true');
                }).catch((err) => {
                    console.log('err on validate payment: ', err);
                    navigate('/events/?paymentError=true');
                });
    }, []);

    return (
        <Loader />
    )
}
