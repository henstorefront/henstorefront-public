import React from 'react'
import styles from './styles.module.scss'

export const Container = ({ children = null }) => (
    <div className={styles.container}>{children}</div>
)