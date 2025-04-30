import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { authAtom } from '@/atoms/userAtom.ts';
import { APIValidatePayment } from '@/api/events.ts';

export const PaymentReturnPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [auth] = useAtom(authAtom);
    useEffect(() => {
        const id = searchParams.get('id');
        if (!id || !auth?.access_token) {
            navigate('/');
            return;
        }
        APIValidatePayment(Number(id), auth.access_token).then((res) => {
            res.data.status == 'finished'
                ? navigate(`/tickets/${res.data.booking_id}`)
                : res.data.status == 'cancelled'
                  ? alert(
                        'При покупке билета произошла ошибка, платеж отменен, денежные средства будут возвращены автоматически.'
                    )
                  : res.data.status == 'new'
                    ? alert('Платеж все еще не обработан.')
                    : null;
        });
    }, [searchParams]);

    return (
        <div>
            Обработка...<Link to={'/'}>Home</Link>
        </div>
    );
};
