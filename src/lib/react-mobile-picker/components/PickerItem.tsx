import {
    HTMLProps,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import { PickerValueData, usePickerActions, usePickerData } from './Picker';
import { useColumnData } from './PickerColumn';

interface PickerItemRenderProps {
    selected: boolean;
}

export interface PickerItemProps
    extends Omit<HTMLProps<HTMLDivElement>, 'value' | 'children'> {
    children: ReactNode | ((renderProps: PickerItemRenderProps) => ReactNode);
    value: PickerValueData;
}

// eslint-disable-next-line
function isFunction(functionToCheck: any): functionToCheck is Function {
    return typeof functionToCheck === 'function';
}

function PickerItem({ style, children, value, ...restProps }: PickerItemProps) {
    const optionRef = useRef<HTMLDivElement | null>(null);
    const { itemHeight, value: pickerValue } = usePickerData('Picker.Item');
    const pickerActions = usePickerActions('Picker.Item');
    const { key } = useColumnData('Picker.Item');

    const isSimple = typeof value === 'string' || typeof value === 'number';
    useEffect(() => {
        return pickerActions.registerOption(key, {
            value: isSimple ? value : value.value,
            element: optionRef,
        });
    }, [key, pickerActions, value]);

    const itemStyle = useMemo(
        () => ({
            height: `${itemHeight}px`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }),
        [itemHeight]
    );

    const handleClick = useCallback(() => {
        isSimple
            ? pickerActions.change(key, value)
            : pickerActions.change(key, value.value);
    }, [pickerActions, key, value]);

    return (
        <div
            style={{
                ...itemStyle,
                ...style,
            }}
            ref={optionRef}
            onClick={handleClick}
            {...restProps}
        >
            {isFunction(children)
                ? children({
                      selected: isSimple
                          ? pickerValue[key] === value
                          : pickerValue[key] === value.title ||
                            pickerValue[key] === value.value,
                  })
                : children}
        </div>
    );
}

export default PickerItem;
