import { IConfirmationType } from '@/components/ConfirmationSelect/ConfirmationSelect.types.ts';
import {FC, useEffect, useState} from 'react';
import css from './CitySelect.module.css';
import { DownArrow } from '@/components/Icons/DownArrow.tsx';
import { Collapse } from 'react-collapse';
import classNames from 'classnames';
import {NearestCity} from "@/utils.ts";
import { locationManager } from '@telegram-apps/sdk-react'

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
            // locationManager.openSettings();
            const location = await locationManager.requestLocation();
            console.log(location)
            const city = NearestCity(location.latitude, location.longitude);
            const closestCity = options.filter((option) => option.text === city.toString());
            onChange(closestCity[0]);
        }
    }
    // useEffect(() => {
    //     const f = async () => {
    //         try {
    //             const promise = locationManager.mount();
    //             locationManager.isMounting(); // true
    //             await promise;
    //             locationManager.isMounting(); // false
    //             locationManager.isMounted(); // true
    //         } catch (err) {
    //             console.log("error", err);
    //             locationManager.mountError(); // equals "err"
    //             locationManager.isMounting(); // false
    //             locationManager.isMounted(); // false
    //         }
    //     }
    //     if (locationManager.mount.isAvailable()) {
    //         f().then();
    //     }
    // }, [locationManager]);


    useEffect(() => {
        // window.onload = function() {
            // HTML5/W3C Geolocation
        navigator.permissions.query({name:'geolocation'}).then(function(result) {
            if (result.state == 'granted') {
                console.log(result.state);
                getLocation().then();
            } else if (result.state == 'prompt') {
                console.log(result.state);
                if (locationManager.openSettings.isAvailable()) {
                    locationManager.openSettings();
                }
                // navigator.geolocation.getCurrentPosition(revealPosition,positionDenied,geoSettings);
            } else if (result.state == 'denied') {
                console.log(result.state);
                const city = NearestCity(59.95940058217715, 30.308801930651814);
                const closestCity = options.filter((option) => option.text === city.toString());
                onChange(closestCity[0]);
            }
            result.onchange = function() {
                console.log(result.state);
            }
        });

        // if (locationManager.openSettings.isAvailable()) {
        //     locationManager.openSettings();
        // }
        // getLocation().then();
            // if (navigator.geolocation) {
            //     navigator.geolocation.getCurrentPosition(UserLocation);
            // } else {
            //     alert("Геолокация не поддерживается.");
            // }
        // }
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
