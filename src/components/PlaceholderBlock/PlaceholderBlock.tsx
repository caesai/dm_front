import css from './PlaceholderBlock.module.css';

interface IPlaceholderBlock {
    width: string;
    height?: string;
    rounded?: string;
    minWidth?: string;
    aspectRatio?: string;
}

export const PlaceholderBlock = ({
    width,
    height,
    rounded,
    minWidth,
    aspectRatio,
}: IPlaceholderBlock) => {
    return (
        <div
            className={css.loadWrapper}
            data-testid="placeholder-block"
            style={{
                width,
                height,
                borderRadius: rounded,
                minWidth,
                aspectRatio,
            }}
        >
            <div className={css.activity}></div>
        </div>
    );
};
