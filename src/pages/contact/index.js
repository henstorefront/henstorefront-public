import React from 'react'
import { Container } from '../../components/container' 
import styles from './styles.module.scss'

export const Contact = () => (
    <Container>
        <div className={styles.contact}>
            <div className={styles.contact__message}>
                <h1>For any inquiries, questions, or concerns, <br /> Contact <a href="https://twitter.com/homeworkpunks"><u>@homeworkpunks</u></a> on Twitter.</h1>
            </div>
        </div>
    </Container>
)