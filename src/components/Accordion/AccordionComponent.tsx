import React, { CSSProperties, useState } from 'react';
import css from './AccordionComponent.module.css';
import { Collapse } from 'react-collapse';
import classNames from 'classnames';
import { DownArrow } from '@/components/Icons/DownArrow.tsx';

interface AccordionProps {
    title: string;
    children: React.ReactNode;
    style?: CSSProperties;
}

const AccordionComponent: React.FC<AccordionProps> = ({ title, style, children }) => {
    const [collapse, setCollapse] = useState<boolean>(false);
    return (
        <section style={style}>
            <div className={css.title} onClick={() => setCollapse((prev) => !prev)}>
                <span>{title}</span>
                <div className={classNames(css.arrow, !collapse ? css.arrow__active : null)}>
                    <DownArrow size={16}></DownArrow>
                </div>
            </div>
            <Collapse isOpened={collapse}>{children}</Collapse>
        </section>
    );
};

export default AccordionComponent;
