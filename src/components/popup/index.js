import React from 'react'
import styles from './styles.module.scss'

export const Popup = (props) => {
    return (props.trigger) ? (
        <div className={styles.popup}>
            <div className={styles.popup__inner}>
                <div className={styles.popup__fixed}>
                    <button
                        type="button"
                        className={styles.close__btn}
                        onClick={() => props.setTrigger(false)}
                        tabIndex="1"
                    >
                        <strong>x</strong>
                    </button>
                </div>
                <div clasName={styles.popup__content}>
                    <strong className={styles.popup__title}>{ props.title }</strong>
                    <br /><br />
                    { props.children }
                </div>
            </div>
        </div>
    ) : null;
}