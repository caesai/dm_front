import React, { useState, useCallback } from 'react';
// import { TextInput } from '@/components/TextInput/TextInput.tsx';
// import { useNavigate } from 'react-router-dom';
// import { RestaurantsListSelector } from '@/components/RestaurantsListSelector/RestaurantsListSelector.tsx';
// import { KitchenIcon } from '@/components/Icons/KitchenIcon.tsx';
// import { DropDownSelect } from '@/components/DropDownSelect/DropDownSelect.tsx';
// import { formatDateShort } from '@/utils.ts';
// import { CalendarIcon } from '@/components/Icons/CalendarIcon.tsx';
// import { PickerValueObj } from '@/lib/react-mobile-picker/components/Picker.tsx';
// import { DateListSelector } from '@/components/DateListSelector/DateListSelector.tsx';
import { Certificate } from '@/components/Certificate/Certificate.tsx';
import { UniversalButton } from '@/components/Buttons/UniversalButton/UniversalButton.tsx';
import css from '@/pages/CertificatesCreatePage/CertificatesCreatePage.module.css';
import classnames from 'classnames';

const ratings = [ '3 000', '5 000', '10 000' ];

export const CertificatesCreateOfflinePage: React.FC = () => {
    // const navigate = useNavigate();
    // const [name, setName] = useState<string>('');

    // const [restaurant, setRestaurant] = useState<PickerValueObj>({
    //     title: 'unset',
    //     value: 'unset',
    // });
    // const [restaurantListSelectorIsOpen, setRestaurantListSelectorIsOpen] = useState(false);
    // const [date, setDate] = useState<PickerValueObj>({
    //     title: 'unset',
    //     value: 'unset',
    // });
    // const [compliment, setCompliment] = useState<string>('');
    const [rating, setRating] = useState<string>('****');
    const [isReady, setIsReady] = useState(false);
    // const [datePopup, setDatePopup] = useState(false);
    // Use state to manage the button's position style declaratively
    // const [isInputFocused, setIsInputFocused] = useState(false);

    // const handleNameChange = useCallback((value: string) => {
    //     if (isReady) return;
    //     if (value.length <= 15) { // Add back manual length check
    //         setName(value);
    //     }
    // }, []);
    //
    // const handleCompliment = useCallback((value: string) => {
    //     if (isReady) return;
    //     if (value.length <= 30) { // Add back manual length check
    //         setCompliment(value);
    //     }
    // }, []);

    const handleRating = useCallback((selectedRating: string) => {
        setRating(selectedRating);
    }, []);
    //
    // const handleFocus = useCallback(() => {
    //     if (isReady) return;
    //     setIsInputFocused(true);
    // }, []);
    //
    // const handleBlur = useCallback(() => {
    //     if (isReady) return;
    //     setIsInputFocused(false);
    // }, []);

    // const validateCertificate = () => {
    //     return name !== '' && compliment !=='' && rating !== '';
    // };

    const handleNextClick = () => {
        // if (!validateCertificate()) return;
        // navigate('/profile');
        setIsReady(true);
    };
    //
    // const setToEditCertificate = () => {
    //     setIsReady(false);
    // }
    //
    // useEffect(() => {
    //     if (validateCertificate()) {
    //         setIsReady(true);
    //     } else {
    //         setIsReady(false);
    //     }
    // }, [name, compliment, rating]);

    return (
        <div className={css.content}>
            {/* <DateListSelector
                isOpen={datePopup}
                setOpen={setDatePopup}
                date={date}
                setDate={setDate}
                values={[]}
            />
            <RestaurantsListSelector
                isOpen={restaurantListSelectorIsOpen}
                setOpen={setRestaurantListSelectorIsOpen}
                restaurant={restaurant}
                selectRestaurant={setRestaurant}
            /> */}
            <Certificate
                placeholder={rating === '****' ? 'Введите сумму' : rating + ' ₽'}
                date={'20.11.2025'}
                rating={rating}
                cardholder={''}
                big={rating !== '****'}
            />
            {!isReady && (
                <div className={css.ratings}>
                    {ratings.map((ratingString) => (
                        <RatingComponent
                            rating={ratingString}
                            key={ratingString} // Use the string value as key
                            onClick={handleRating}
                            selectedRating={rating}
                        />
                    ))}
                </div>
            )}
            <div className={css.fields}>
                {/* <DropDownSelect
                    title={restaurant.value !== 'unset' ? restaurant?.title : 'Откуда заберете сертификат?'}
                    // isValid={dateValidated}
                    icon={<KitchenIcon size={24} />}
                    onClick={() => {
                        setRestaurantListSelectorIsOpen(true);
                    }} isValid={true}
                />
                <DropDownSelect
                    title={date.value !== 'unset' ? formatDateShort(
                        date.value
                    ) : 'Когда заберете сертификат?'}
                    isValid={true}
                    disabled={restaurant.value === 'unset'}
                    icon={<CalendarIcon size={24}/>}
                    onClick={() =>
                        setDatePopup(true)
                    }
                /> */}
                {/*<TextInput*/}
                {/*    value={name}*/}
                {/*    onChange={handleNameChange}*/}
                {/*    placeholder={'Имя получателя'}*/}
                {/*    onFocus={handleFocus}*/}
                {/*    onBlur={handleBlur}*/}
                {/*    // maxLength={15} // Enforce length constraint*/}
                {/*/>*/}
                {/*<TextInput*/}
                {/*    value={compliment}*/}
                {/*    onChange={handleCompliment}*/}
                {/*    placeholder={'Ваше поздравление'}*/}
                {/*    onFocus={handleFocus}*/}
                {/*    onBlur={handleBlur}*/}
                {/*    // maxLength={30} // Enforce length constraint*/}
                {/*/>*/}
            </div>
            {/* Conditionally apply a CSS class for positioning */}
            <div
                data-testid="button-container"
                className={classnames(
                    css.absoluteBottom,
                    // { [css.relativeBottom]: isInputFocused }
                )}
            >
                <div className={css.bottomWrapper}>
                    {/*{!isReady ?*/}
                        <UniversalButton
                            width={'full'}
                            title={'Далее'}
                            // theme={!validateCertificate() ? undefined : 'red'}
                            action={handleNextClick}
                        />
                    {/*: (*/}
                    {/*        <>*/}
                    {/*            <UniversalButton*/}
                    {/*                width={'full'}*/}
                    {/*                title={'Редактировать'}*/}
                    {/*                action={setToEditCertificate}*/}
                    {/*            />*/}
                    {/*            <UniversalButton*/}
                    {/*                width={'full'}*/}
                    {/*                title={'Оплатить'}*/}
                    {/*                theme={!validateCertificate() ? undefined : 'red'}*/}
                    {/*                action={handleNextClick}*/}
                    {/*            />*/}
                    {/*        </>*/}
                    {/*    )}*/}
                </div>
            </div>
        </div>
    );
}

interface RatingComponentProps {
    rating: string;
    selectedRating: string;
    onClick: (rating: string) => void;
}

const RatingComponent: React.FC<RatingComponentProps> = ({ rating, selectedRating, onClick }) => {
    return (
        <div
            className={classnames(
                css.rating,
                {
                    [css.ratingActive]: selectedRating === rating,
                }
            )}
            onClick={() => onClick(rating)}
        >
            <span>{rating} ₽</span>
        </div>
    );
};
