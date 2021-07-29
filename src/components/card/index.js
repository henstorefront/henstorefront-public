import React from 'react'
import styles from './styles.module.scss'

export const Card = ({
    children,
    title,
    special,
}) => {
    if (title) {
        if (special) {
            return (
                <div className={styles.card__special}>
                    <div className={styles.card__content}>
                        <div className={styles.card__button}>
                            <h1 className={styles.card__title}>{title}</h1>
                        </div>
                        <div className={styles.card__content__inner}>
                            {children}                
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className={styles.card}>
                    <div className={styles.card__content}>
                        <div className={styles.card__button}>
                            <h1 className={styles.card__title}>{title}</h1>
                        </div>
                        <div className={styles.card__content__inner}>
                            {children}                
                        </div>
                    </div>
                </div>
            )
        }
    } else {
        return (
            <div className={styles.card}>
                <div className={styles.card__content}>
                    <div className={styles.card__content__inner}>
                        {children}                
                    </div>
                </div>
            </div>
        )
    }
}