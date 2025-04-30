import css from './Taxi.module.css';

interface TaxiProps {
    lonlng: string;
    address: string;
}

export const Taxi = ({ lonlng, address }: TaxiProps) => {
    return (
        <div className={css.yandexTaxi}>
            <a
                href={`https://3.redirect.appmetrica.yandex.com/route?end-lat=${lonlng.split(',')[1]}&end-lon=${lonlng.split(',')[0]}&tariffClass=business&ref=https%3A%2F%2Fhome.efinskiy.ru&appmetrica_tracking_id=1178268795219780156&lang=ru`}
                className={css.content}
                target={'_blank'}
                rel="noreferrer"
            >
                <span className={css.yandexTaxiWidget}>
                    <span className={css.title}>Вызвать такси</span>
                    <span className={css.subtitle}>{address}</span>
                </span>
            </a>
        </div>
    );
};
