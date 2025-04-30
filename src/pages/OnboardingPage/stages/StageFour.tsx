import css from '../OnboardingPage.module.css';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { Star } from 'react-iconly';

export const StageFour = () => {
    const navigate = useNavigate();
    return (
        <div className={classNames(css.stage_page)}>
            <div className={classNames(css.stage_page_wrapper)}>
                <div className={css.stage_footer}>
                    <div className={css.stage_description}>
                        <h2 className={classNames(css.stage_description_title)}>
                            Делитесь впечатлениями
                        </h2>
                        <span
                            className={classNames(
                                css.stage_description_subtitle
                            )}
                        >
                            Чтобы стать лучше, нам важно ваше мнение.
                        </span>
                    </div>
                    <div className={css.button_container}>
                        <div
                            className={css.redButton}
                            onClick={() => navigate('/onboarding/5')}
                        >
                            <span>Продолжить</span>
                        </div>
                    </div>
                </div>
                <div className={css.stageFour_wrapper}>
                    <div className={css.stageFour_content}>
                        <div className={classNames(css.opinion, css.opinion_1)}>
                            <span>Музыка</span>
                        </div>

                        <Star
                            filled
                            primaryColor={'var(--red)'}
                            secondaryColor={'var(--red)'}
                            size={'large'}
                            style={{
                                position: 'relative',
                                top: '5px',
                                left: '145px',
                                transform: 'rotate(-6deg)',
                            }}
                        ></Star>
                        <div className={classNames(css.opinion, css.opinion_2)}>
                            <span>Гостеприимство</span>
                        </div>
                        <div className={classNames(css.opinion, css.opinion_3)}>
                            <span>Чистота и комфорт</span>
                        </div>
                        <div className={classNames(css.opinion, css.opinion_4)}>
                            <span>Размер порции и подача</span>
                        </div>
                        <div className={classNames(css.opinion, css.opinion_5)}>
                            <span>Скорость обслуживания</span>
                        </div>
                        <div className={classNames(css.opinion, css.opinion_6)}>
                            <span>Атмосфера</span>
                        </div>
                        <div className={classNames(css.opinion, css.opinion_7)}>
                            <span>Дополнительные удобства</span>
                        </div>
                        <div className={classNames(css.opinion, css.opinion_8)}>
                            <span>Вкус блюд и напитков</span>
                        </div>
                        <Star
                            filled
                            primaryColor={'var(--red)'}
                            secondaryColor={'var(--red)'}
                            size={'large'}
                            style={{
                                position: 'relative',
                                top: '-140px',
                                left: '145px',
                                transform: 'rotate(-33deg)',
                            }}
                        ></Star>
                        <Star
                            filled
                            primaryColor={'var(--red)'}
                            secondaryColor={'var(--red)'}
                            size={'large'}
                            style={{
                                position: 'relative',
                                top: '-64px',
                                left: '166px',
                                transform: 'rotate(110deg)',
                            }}
                        ></Star>
                        <Star
                            filled
                            primaryColor={'var(--red)'}
                            secondaryColor={'var(--red)'}
                            size={'large'}
                            style={{
                                position: 'relative',
                                top: '-93px',
                                left: '159px',
                                transform: 'rotate(-33deg)',
                            }}
                        ></Star>
                        <Star
                            filled
                            primaryColor={'var(--red)'}
                            secondaryColor={'var(--red)'}
                            size={'large'}
                            style={{
                                position: 'relative',
                                top: '-16px',
                                left: '8px',
                                transform: 'rotate(-33deg)',
                            }}
                        ></Star>
                        <Star
                            filled
                            primaryColor={'var(--red)'}
                            secondaryColor={'var(--red)'}
                            size={'large'}
                            style={{
                                position: 'relative',
                                top: '33px',
                                left: '117px',
                                transform: 'rotate(-13deg)',
                            }}
                        ></Star>
                        <Star
                            filled
                            primaryColor={'var(--red)'}
                            secondaryColor={'var(--red)'}
                            size={'large'}
                            style={{
                                position: 'relative',
                                top: '35px',
                                left: '-174px',
                                transform: 'rotate(-33deg)',
                            }}
                        ></Star>
                        <Star
                            filled
                            primaryColor={'var(--red)'}
                            secondaryColor={'var(--red)'}
                            size={'large'}
                            style={{
                                position: 'relative',
                                top: '-5px',
                                left: '-194px',
                                transform: 'rotate(-33deg)',
                            }}
                        ></Star>
                        <Star
                            filled
                            primaryColor={'var(--red)'}
                            secondaryColor={'var(--red)'}
                            size={'large'}
                            style={{
                                position: 'relative',
                                top: '-35px',
                                left: '-215px',
                                transform: 'rotate(-1deg)',
                            }}
                        ></Star>
                        <Star
                            filled
                            primaryColor={'var(--red)'}
                            secondaryColor={'var(--red)'}
                            size={'large'}
                            style={{
                                position: 'relative',
                                top: '-43px',
                                left: '-272px',
                                transform: 'rotate(-56deg)',
                            }}
                        ></Star>
                    </div>
                </div>
            </div>
        </div>
    );
};
