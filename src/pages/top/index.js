import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../../components/container'
import { Card } from '../../components/card'
import { ResponsiveMasonry } from '../../components/responsive-masonry'
import styles from './styles.module.scss'
import { LazyLoadImage } from 'react-lazy-load-image-component'

const axios = require('axios')
const fetch = require('node-fetch')

async function fetchTop () {
    const response = await fetch("https://api.hicdex.com/cache/artists_by_primary_sales.json");
    const data = await response.json();
    return data
}

const getRestrictedAddresses = async () =>
    await axios
        .get(
            'https://raw.githubusercontent.com/hicetnunc2000/hicetnunc/main/filters/w.json'
        )
        .then((res) => res.data)

const getBlacklistedAddresses = async () =>
await axios
    .get(
        'https://raw.githubusercontent.com/henstorefront/henstorefront/master/src/filters/blacklist.json'
    )
    .then((res) => res.data)

export default class Top extends Component {

    state = {
        raw: [],
        cleaned: [],
    }

    componentDidMount = async () => {
        this.setState({ raw : await fetchTop() })
        this.clean()
    }

    clean = async () => {
        let list = await getRestrictedAddresses()
        let blacklist = await getBlacklistedAddresses()
        // console.log(blacklist)

        let cleanedArray = this.state.raw.filter(function(creators) {
            return !list.includes(creators.address) && !blacklist.includes(creators.address);
        })
        const shortenedArray = cleanedArray.slice(0, 100)

        this.setState({ cleaned : shortenedArray })

        // console.log(cleanedArray);
        // console.log(shortenedArray)
    }

    render() {
        return (
            <Container>
                <div className={styles.top}>
                    <div className={styles.top__message}>
                        <h1 className={styles.message__top}>Top Creators by First-Market Sales</h1>
                        <h3 className={styles.message__bottom}>Don't see yourself? <a href="https://hicetnunc.xyz/config"><u>Set your SUBJKT here.</u></a></h3>
                    </div>
                    <div className={styles.card__container}>
                        <ResponsiveMasonry>
                            {this.state.cleaned.map((creator, index) => (
                                <Card>
                                    <div className={styles.top__creator__infos}>
                                        <LazyLoadImage className={styles.creator__avatar} src={'https://services.tzkt.io/v1/avatars2/' + creator.address} />
                                        <Link to={'/storefront/tz/' + creator.address} className={styles.creator__info__container}>
                                            {creator.name !== ''
                                            ? <div className={styles.inner__infos}><h2>{index + 1}&nbsp;{creator.name}</h2><hr /><h2>{creator.sum / 1000000} XTZ</h2></div>
                                            : <div className={styles.inner__infos}><h2>{index + 1}&nbsp;{creator.address}</h2><hr /><h2>{creator.sum / 1000000} XTZ</h2></div>
                                            }
                                        </Link>
                                    </div>
                                </Card>
                            ))}
                        </ResponsiveMasonry>
                    </div>
                </div>
            </Container>
        )
    }
}
