import { Page } from '@/components/Page.tsx';
import css from './BanquetAdditionalServicesPage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { useEffect, useState } from 'react';
import { BanquetCheckBox } from '@/components/BanquetCheckBox/BanquetCheckBox.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { banquetAdditionalOptions } from '@/__mocks__/banquets.mock.ts';
import { IBanquetAdditionalOptions } from '@/types/banquets.ts';

export const BanquetAdditionalServicesPage = () => {
    const navigate = useNavigate();
    const {restaurant_id} = useParams();

    const [options, setOptions] = useState<IBanquetAdditionalOptions[]>([]);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    const toggleService = (serviceName: string) => {
        setSelectedServices(prev => {
            if (prev.includes(serviceName)) {
                return prev.filter(name => name !== serviceName);
            } else {
                return [...prev, serviceName];
            }
        });
    };

    const goBack = () => {
        navigate(`/banquets/${restaurant_id}/option`);
    }

    useEffect(() => {
        setOptions(banquetAdditionalOptions);
    }, []);

    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.pageWrapper}>
                    <div className={css.header}>
                        <RoundedButton
                            icon={<BackIcon color={'var(--dark-grey)'} />}
                            action={goBack}
                        ></RoundedButton>
                        <span className={css.header_title}>Дополнительные услуги</span>
                        <div />
                    </div>
                    <ContentContainer>
                        <ContentBlock>
                            {options.map((option) => (
                                <BanquetCheckBox
                                    key={option.name}
                                    checked={selectedServices.includes(option.name)}
                                    toggle={() => toggleService(option.name)}
                                    label={option.name}
                                />
                            ))}
                        </ContentBlock>
                        <ContentBlock>
                            <span className={css.text}>Не входит в стоимость, оплачивается отдельно</span>
                        </ContentBlock>
                        <div className={css.button}>
                            <UniversalButton
                                width={'full'}
                                title={'Продолжить'}
                                theme={'red'}
                                action={() => navigate(`/banquets/${restaurant_id}/reservation`)}
                            />
                        </div>
                    </ContentContainer>
                </div>
            </div>
        </Page>
    )
}