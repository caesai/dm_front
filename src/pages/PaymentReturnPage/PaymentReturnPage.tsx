import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/userAtom.ts';
import { APIValidatePayment } from '@/api/events.ts';
import {AppLoadingScreen} from "@/components/AppLoadingScreen/AppLoadingScreen.tsx";

export const PaymentReturnPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [auth] = useAtom(authAtom);

    useEffect(() => {
        console.log('searchParams: ', searchParams.get('event_id'))
        const id = searchParams.get('id');
        if (!id || !auth?.access_token) {
            navigate('/');
            return;
        }
        APIValidatePayment(Number(id), auth.access_token).then((res) => {
            res.data.paid ? navigate(`/tickets/${res.data.event_id}`) : navigate('/events/' + Number(id) + '?paymentError=true');
        }).catch((err) => {
            console.log('err on validate payment: ', err);
            navigate('/events/' + Number(id) + '?error=true');
        });
    }, [searchParams]);

    return (
        <AppLoadingScreen />
    );
};
