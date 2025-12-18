import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAtom } from 'jotai';
// APIs
import { APIValidatePayment } from '@/api/events.api.ts';
// Components
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';
// Atoms
import { authAtom } from '@/atoms/userAtom.ts';

export const EventPaymentSuccessPage: React.FC = () => {
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
            })
            .catch((err) => {
                console.log('err on validate payment: ', err);
                navigate('/events/?paymentError=true');
            });
    }, [orderId, auth]);

    return <Loader />;
};
