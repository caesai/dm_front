import {IConfirmationType} from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';
import {FC, useEffect, useState} from 'react';
import css from './CitySelect.module.css';
import {DownArrow} from '@/components/Icons/DownArrow.tsx';
import {Collapse} from 'react-collapse';
import classNames from 'classnames';
import {NearestCity} from "@/utils.ts";
import {locationManager} from '@telegram-apps/sdk-react'

interface IConfirmationSelect {
    options: IConfirmationType[];
    currentValue: IConfirmationType;
    onChange: (city: IConfirmationType) => void;
}

export const CitySelect: FC<IConfirmationSelect> = ({
                                                        options,
                                                        currentValue,
                                                        onChange,
                                                    }) => {
    const [collapse, setCollapse] = useState(false);
    const selectOnChange = (id: string, text: string) => {
        const newValue: IConfirmationType = {
            id: id,
            text: text,
        };
        onChange(newValue);
        setCollapse((prev) => !prev);
    };

    const getLocation = async () => {
        if (locationManager.requestLocation.isAvailable()) {
            const location = await locationManager.requestLocation();
            console.log(location)
            const city = NearestCity(location.latitude, location.longitude);
            const closestCity = options.filter((option) => option.text === city.toString());
            onChange(closestCity[0]);
        }
    }

    useEffect(() => {
        if (locationManager.openSettings.isAvailable() && !locationManager.isAccessRequested() && navigator.platform.startsWith("iP") ) {
            // locationManager.openSettings();
        }
        if (!locationManager.isAccessRequested() && locationManager.isAccessGranted()) {
            getLocation().then();
        }
    }, []);

    return (
        <div className={classNames(css.selectWrapper)}>
            <div
                className={css.select}
                onClick={() => setCollapse((prev) => !prev)}
            >
                <div className={css.textWrap}>
                    <span className={css.currentValue}>
                        {currentValue.text}
                    </span>
                </div>
                <div
                    className={classNames(
                        css.arrow,
                        !collapse ? css.arrow__active : null
                    )}
                >
                    <DownArrow color={'var(--grey)'} size={16}></DownArrow>
                </div>
            </div>
            <Collapse isOpened={collapse}>
                <div className={classNames(css.optionWrapper)}>
                    {options.map((v) => (
                        <div
                            key={v.id}
                            className={css.option}
                            onClick={() => selectOnChange(v.id, v.text)}
                        >
                            <span className={css.option_title}>{v.text}</span>
                            <div
                                className={classNames(
                                    css.option_checkbox,
                                    currentValue.id == v.id
                                        ? css.option_checkbox__checked
                                        : null
                                )}
                            ></div>
                        </div>
                    ))}
                </div>
            </Collapse>
        </div>
    );
};
