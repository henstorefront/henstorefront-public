import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../../components/container'
import { ResponsiveMasonry } from '../../components/responsive-masonry'
import { Card } from '../../components/card'
import styles from './styles.module.scss'

export default class Favorites extends Component {
    state = {
        favorites: JSON.parse(localStorage.getItem('henstorefront-favorites')) || [], 
    }
    render() {
        return (
            <Container>
                <div className={styles.favorites}>
                    <div className={styles.favorite__message}>
                        <h1>All your favorite creators, in one place,
                            <br />
                            click them to visit their storefronts.
                        </h1>
                    </div>
                </div>
                <div className={styles.card__container}>
                    <ResponsiveMasonry>
                        {this.state.favorites.map(favorite => (
                            <Link to={'/storefront/tz/' + favorite.address}>
                                <Card>
                                    {favorite.name !== ''
                                        ? <div><h1>{favorite.name}'s storefront.</h1></div>
                                        : <div><h1>{favorite.address}'s storefront</h1></div>
                                    }
                                </Card>
                            </Link>

                        ))}
                    </ResponsiveMasonry>
                </div>
            </Container>
        )
    }
}