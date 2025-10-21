import React, { useEffect, useState } from 'react';
import { Page } from '@/components/Page.tsx';
import { RoundedButton } from '@/components/RoundedButton/RoundedButton.tsx';
import { BackIcon } from '@/components/Icons/BackIcon.tsx';
import { useLocation, useNavigate } from 'react-router-dom';
import css from '@/pages/AllergiesPage/AllergiesPage.module.css';
import { CommentaryOptionButton } from '@/components/CommentaryOptionButton/CommentaryOptionButton.tsx';
import { allergiesOptions } from '@/__mocks__/allergies.mock.ts';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import { TextInput } from '@/components/TextInput/TextInput.tsx';
import { getCommonStrings } from '@/utils.ts';

const AllergiesPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
    const [isOtherOption, setIsOtherOption] = useState<boolean>(false);
    const [otherAllergyOptions, setOtherAllergyOptions] = useState<string>('');

    const allergies: string[] = location.state?.allergies;

    useEffect(() => {
        if (allergies) {
            const allergiesOptionsArray = allergiesOptions.map((item) => item.content);
            const commonAllergies = getCommonStrings(allergies, allergiesOptionsArray);
            console.log('commonAllergies: ', commonAllergies);
        }
    }, [allergies]);

    const onOptionSelect = (option: string) => {
        // Create a new array based on the previous state.
        setSelectedAllergies(prevSelectedAllergies => {
            // Check if the item already exists in the array.
            if (prevSelectedAllergies.includes(option)) {
                // If it exists, filter it out (remove it).
                return prevSelectedAllergies.filter(item => item !== option);
            } else {
                // If it doesn't exist, add it to the new array using the spread operator.
                return [...prevSelectedAllergies, option];
            }
        });
    };

    const toggleOtherOption = () => {
        setIsOtherOption((prev) => !prev)
    }

    const handleOtherAllergyOptions = (value: string) => {
        setOtherAllergyOptions(value);
    }

    const handleContinue = () => {
        navigate('/me', { state: {
                allergies: [...selectedAllergies, ...otherAllergyOptions.split(',')],
            }
        });
    }

    return (
        <Page back={true}>
            <div className={css.page}>
                <div className={css.header}>
                    <RoundedButton
                        icon={<BackIcon size={24} color={'var(--dark-grey)'} />}
                        action={() => navigate(-1)}
                    />
                    <span className={css.header_title}>Личные данные</span>
                    <div className={css.header_spacer} />
                </div>
                <div className={css.options}>
                    {allergiesOptions.map((item, index) => (
                        <CommentaryOptionButton
                                newDesign
                                text={item.content}
                                icon={item.icon}
                                active={selectedAllergies.includes(item.content)}
                                onClick={() => onOptionSelect(item.content)}
                                key={index}
                            />
                        )
                    )}
                    <CommentaryOptionButton
                        newDesign
                        text={'Другое'}
                        icon={''}
                        active={isOtherOption}
                        onClick={toggleOtherOption}
                    />
                </div>
                {isOtherOption && (
                    <div className={css.fields}>
                        <TextInput
                            value={otherAllergyOptions}
                            onChange={handleOtherAllergyOptions}
                            placeholder={'Укажите другой аллерген'}
                        />
                    </div>
                )}
                <div className={css.button}>
                    <UniversalButton
                        width={'full'}
                        title={'Сохранить'}
                        theme={selectedAllergies.length > 0 || otherAllergyOptions.length > 0 ? 'red' : undefined}
                        action={selectedAllergies.length > 0 || otherAllergyOptions.length > 0 ? handleContinue : undefined}
                    />
                </div>
            </div>
        </Page>
    );
};

export default AllergiesPage;
