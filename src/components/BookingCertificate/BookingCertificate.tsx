import css from "./BookingCertificate.module.css"

interface IBookingCertificate {
    value: number
    expired_at: string
}

const BookingCertificate: React.FC<IBookingCertificate> = ({ value, expired_at }) => {
    return (
        <section className={css.certificate}>
            <span className={css.certificate_name}>Онлайн-сертификат</span>
            <div className={css.certificate_info}>
                <div>
                    <span className={css.info_title}>Номинал:</span>
                    <span className={css.info_text}>{value}₽</span>
                </div>
                <div>
                    <span className={css.info_title}>Срок действия:</span>
                    <span className={css.info_text}>до {expired_at}</span>
                </div>
            </div>
        </section>
    )
}

export default BookingCertificate