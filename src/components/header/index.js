import React, { useContext, useRef, useEffect } from 'react'
import { StorefrontContext } from '../../context/StorefrontContext'
import { getItem, setItem } from '../../utils/storage'
import { Link } from 'react-router-dom'
import { useDetectOutsideClick } from './useDetectOutsideClick'
import styles from './styles.module.scss'

export const Header = () => {
    const dropdownRef = useRef(null);
    const [isActive, setIsActive] = useDetectOutsideClick(dropdownRef, false);
    const onClick = () => setIsActive(!isActive);
    
    const context = useContext(StorefrontContext);

    useEffect(() => {
        context.setTheme(getItem('theme') || setItem('theme', 'dark'))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (<>
        <header className={styles.bar__fixed}>
            <nav>
                <div className={styles.logo}>
                    <Link to="/">[hic et nunc] storefront</Link>
                </div>
                <div className={styles.nav__links}>
                    <div className={styles.nav__desktop}>
                        <Link to="/search">Search</Link>
                        <Link to="/favorites">Favorites</Link>
                        <Link to="/random">Random</Link>
                        <Link to="/top">Top 100</Link>                        
                    </div>
                    <div className={styles.dropdown__container}>
                        <button
                            onClick={onClick}
                            className={styles.dropdown__trigger}
                        >
                            More...
                        </button>
                        <nav
                            ref={dropdownRef}
                            className={`${styles.menu} ${isActive ? styles.active : styles.inactive}`}
                        >
                            <ul>
                                <li>
                                    <Link to="/search">Search for artists</Link>
                                </li>
                                <li>
                                    <Link to="/favorites">Go to favorite artists</Link>
                                </li>
                                <li>
                                    <Link to="/random">Go to random artists</Link>
                                </li>
                                <li>
                                    <Link to="/top">View top 100 artists</Link>
                                </li>
                                <li>
                                    <a href="https://github.com/henstorefront/henstorefront">Make it your own (fork me!)</a>
                                </li>
                                <li>
                                    <Link to="/contact">Feedback, errors & contact</Link>
                                </li>
                                <li className={styles.theme__container}>
                                    <div className={styles.theme__button} onClick={() =>
                                        context.setTheme(context.theme === 'light' ? 'dark' : 'light')
                                    } />
                                    {context.theme === 'light' ? <div>Set Dark mode</div> : <div>Set Light Mode</div>}
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </nav>
        </header>
    </>)
}