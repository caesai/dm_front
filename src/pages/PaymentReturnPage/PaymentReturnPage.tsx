import {
    // useNavigate,
    useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
// import { useAtom } from 'jotai';
// import { authAtom } from '@/atoms/userAtom.ts';
// import { APIValidatePayment } from '@/api/events.ts';
import { Loader } from '@/components/AppLoadingScreen/AppLoadingScreen.tsx';

export const PaymentReturnPage = () => {
    const [params] = useSearchParams();
    const paramsObject = Object.fromEntries(params.entries());
    // const navigate = useNavigate();
    // const [auth] = useAtom(authAtom);
    // TODO: delete this page when refactor
    useEffect(() => {
        console.log('searchParams: ', paramsObject)
    //     const id = searchParams.get('id');
    //     const event_id = searchParams.get('event_id');
    //     if (!id || !auth?.access_token) {
    //         navigate('/');
    //         return;
    //     }
    //     APIValidatePayment(Number(id), auth.access_token).then((res) => {
    //         res.data.paid ? navigate(`/tickets/${res.data.event_id}`) : navigate('/events/' + Number(event_id) + '?paymentError=true');
    //     }).catch((err) => {
    //         console.log('err on validate payment: ', err);
    //         navigate('/events/' + Number(event_id) + '?error=true');
    //     });
    }, [paramsObject]);

    return (
        <Loader />
    );
};
