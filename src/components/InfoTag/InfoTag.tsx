import css from './InfoTag.module.css';

interface Props {
    text: string;
}

export const InfoTag = ({ text }: Props) => {
    return (
        <div className={css.tag}>
            <span className={css.tagText}>{text}</span>
        </div>
    );
};
