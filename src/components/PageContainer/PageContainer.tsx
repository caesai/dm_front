import { FC } from 'react';
import css from './PageContainer.module.css';

interface IProps {
    children: React.ReactNode;
    id?: string;
}

export const PageContainer: FC<IProps> = ({ children, id }: IProps) => {
    return (
        <div className={css.pageContainer} id={id}>
            {children}
        </div>
    );
};
