import React, { useContext, useEffect } from 'react'
import { StorefrontContext } from '../../context/StorefrontContext'
import { Link } from 'react-router-dom'
import { getItem, setItem } from '../../utils/storage'
import styles from './styles.module.scss'

export const Footer = () => {
    const context = useContext(StorefrontContext)

    useEffect(() => {
        context.setTheme(getItem('theme') || setItem('theme', 'dark'))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <div className={styles.box__fixed}>
            <footer>
                <div className={styles.button__container}>
                    <div className={styles.theme__button} onClick={() =>
                            context.setTheme(context.theme === 'light' ? 'dark' : 'light')
                    }/>
                    <p className={styles.content}>Consider supporting the creator of this tool by <Link href="https://hicetnunc.xyz/tz/https://www.hicetnunc.xyz/tz/tz1V9ZviaGUWZjGx4U7cGYFEyUGyqpFnVGXx"><u>visiting them on hicetnunc</u></Link>.</p>
                </div>
            </footer>
        </div>        
    )
}