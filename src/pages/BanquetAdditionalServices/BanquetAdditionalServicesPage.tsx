import { Page } from '@/components/Page.tsx';
import css from './BanquetAdditionalServicesPage.module.css';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { useState } from 'react';
import { BanquetCheckBox } from '@/components/BanquetCheckBox/BanquetCheckBox.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';

export const BanquetAdditionalServicesPage = () => {
    const navigate = useNavigate();
    const {restaurant_id} = useParams();

    const [services, setServices] = useState({
        individualDecoration: false,
        menuDevelopment: false,
        winePairing: false,
        customCake: false,
        hosts: false,
        musician: false,
        mediaEquipment: false,
    });

    const toggleService = (serviceName: keyof typeof services) => {
        setServices(prev => ({
            ...prev,
            [serviceName]: !prev[serviceName]
        }));
    };

    const goBack = () => {
        navigate(`/banquets/${restaurant_id}/option`);
    }

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
                            <BanquetCheckBox
                                checked={services.individualDecoration}
                                toggle={() => toggleService('individualDecoration')}
                                label={'Индивидуальное оформление площадки'}
                            />
                            <BanquetCheckBox
                                checked={services.menuDevelopment}
                                toggle={() => toggleService('menuDevelopment')}
                                label={'Разработка меню'}
                            />
                            <BanquetCheckBox
                                checked={services.winePairing}
                                toggle={() => toggleService('winePairing')}
                                label={'Винное сопровождение'}
                            />
                            <BanquetCheckBox
                                checked={services.customCake}
                                toggle={() => toggleService('customCake')}
                                label={'Торт по индивидуальному заказу'}
                            />
                            <BanquetCheckBox
                                checked={services.hosts}
                                toggle={() => toggleService('hosts')}
                                label={'Ведущие'}
                            />
                            <BanquetCheckBox
                                checked={services.musician}
                                toggle={() => toggleService('musician')}
                                label={'Музыкант / группа'}
                            />
                            <BanquetCheckBox
                                checked={services.mediaEquipment}
                                toggle={() => toggleService('mediaEquipment')}
                                label={'Медиаоборудование'}
                            />
                        </ContentBlock>
                        <ContentBlock>
                            <span className={css.text}>Не входит в стоимость, оплачивается отдельно</span>
                        </ContentBlock>
                        <div className={css.button}>
                            <UniversalButton
                                width={'full'}
                                title={'Продолжить'}
                                theme={'red'}
                            />
                        </div>
                    </ContentContainer>
                </div>
            </div>
        </Page>
    )
}