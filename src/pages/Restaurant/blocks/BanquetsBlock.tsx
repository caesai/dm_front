import { IBanquet } from '@/types/banquets.types.ts';
import { IWorkTime } from '@/types/restaurant.ts';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { workdayIndexMap } from '@/utils.ts';
import { ContentContainer } from '@/components/ContentContainer/ContentContainer.tsx';
import { ContentBlock } from '@/components/ContentBlock/ContentBlock.tsx';
import { HeaderContainer } from '@/components/ContentBlock/HeaderContainer/HeaderContainer.tsx';
import { HeaderContent } from '@/components/ContentBlock/HeaderContainer/HeaderContent/HeaderContainer.tsx';
import css from '@/pages/Restaurant/Restaurant.module.css';
import classNames from 'classnames';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';

interface BanquetsBlockProps {
    image: string;
    description: string;
    restaurant_id: number;
    restaurant_title: string;
    banquets: IBanquet;
    workTime: IWorkTime[] | undefined;
}

export const BanquetsBlock: React.FC<BanquetsBlockProps> = ({
    description,
    image,
    restaurant_id,
    restaurant_title,
    banquets,
    workTime,
}) => {
    const navigate = useNavigate();
    const navigateToBanquet = () => {
        const workTimeSorted = workTime?.sort((a, b) => workdayIndexMap[a.weekday] - workdayIndexMap[b.weekday]);
        navigate(`/banquets/${restaurant_id}/choose`, {
            state: { restaurant_title, banquets, workTime: workTimeSorted },
        });
    };
    return (
        <ContentContainer>
            <ContentBlock>
                <HeaderContainer>
                    <HeaderContent title={'Банкеты'} id={'banquet'} />
                </HeaderContainer>
                <div className={css.banquetContainer}>
                    <div className={css.banquetImg}>
                        <div
                            className={classNames(css.banquetImage, css.bgImage)}
                            style={{
                                backgroundImage: `url(${image})`,
                            }}
                        ></div>
                    </div>
                    <span className={css.banquetDescription}>{description}</span>
                    <UniversalButton width={'full'} title={'Подробнее'} action={navigateToBanquet} />
                </div>
            </ContentBlock>
        </ContentContainer>
    );
};