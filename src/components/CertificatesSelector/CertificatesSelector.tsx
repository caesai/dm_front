import React, { useState } from 'react';
import { CheckBoxInput } from '@/components/CheckBoxInput/CheckBoxInput.tsx';
import css from '@/components/CertificatesSelector/CertificatesSelector.module.css';

export const CertificatesSelector: React.FC = () => {
    const [type, setType] = useState<number | null>(null);
    return (
        <div className={css.certificatesSelector}>
            <div className={css.certificateOption}>
                <CheckBoxInput
                    checked={type === 0}
                    toggle={() => setType(0)}
                    label={'Использовать онлайн-сертификат'}
                    noBackground
                />
                <div className={css.optionRow}>
                    <div className={css.optionColumn}>
                        <span>Номинал:</span>
                        <span className={css.rating}>10 000 ₽</span>
                    </div>
                    <div className={css.optionColumn}>
                        <span>Срок действия</span>
                        <span className={css.date}>до 10.11.2025</span>
                    </div>
                </div>
                <div className={css.optionRow}>
                    <div className={css.optionColumn}>
                        <span>Номинал:</span>
                        <span className={css.rating}>10 000 ₽</span>
                    </div>
                    <div className={css.optionColumn}>
                        <span>Срок действия</span>
                        <span className={css.date}>до 10.11.2025</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
