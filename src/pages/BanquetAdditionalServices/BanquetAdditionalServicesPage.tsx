import { Page } from '@/components/Page.tsx';
import css from './BanquetAdditionalServicesPage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { useEffect, useState } from 'react';
import { BanquetCheckbox } from '@/components/BanquetCheckbox/BanquetCheckbox.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { IBanquetAdditionalOptions } from '@/types/banquets.types.ts';

export const BanquetAdditionalServicesPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {id} = useParams();
    const banquetData = location.state.banquetData;
    const options: IBanquetAdditionalOptions[] = banquetData.additionalOptions;
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
        navigate(`/banquets/${id}/option`, { state: { ...location.state } });
    }

    const goNext = () => {
        const reservationData = {
            ...banquetData,
            selectedServices
        };

        navigate(`/banquets/${id}/reservation`, {state: { ...location.state, reservationData}});
    }

    useEffect(() => {
        if (!options) {
            navigate(`/banquets/${id}/reservation`, {
                state: banquetData
            });
        }
    }, [options, banquetData]);

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
                    <ContentContainer >
                        <ContentBlock>
                            <div className={css.checkbox}>
                                {options && (
                                    options.map((option: IBanquetAdditionalOptions) => (
                                        <BanquetCheckbox
                                            key={option.id}
                                            checked={selectedServices.includes(option.name)}
                                            toggle={() => toggleService(option.name)}
                                            label={option.name}
                                        />
                                    ))
                                )}
                            </div>
                        </ContentBlock>
                        <ContentBlock>
                            <span className={css.text}>Не входит в стоимость, оплачивается отдельно</span>
                        </ContentBlock>
                    </ContentContainer>
                    <div className={css.button}>
                        <UniversalButton
                            width={'full'}
                            title={'Продолжить'}
                            theme={'red'}
                            action={goNext}
                        />
                    </div>
                </div>
            </div>
        </Page>
    )
}
