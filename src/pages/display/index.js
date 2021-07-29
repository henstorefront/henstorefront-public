import React, { Component } from 'react'
import { Container } from '../../components/container'
import { Card } from '../../components/card'
import { ResponsiveMasonry } from '../../components/responsive-masonry'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import styles from './styles.module.scss'

const axios = require('axios')
const fetch = require('node-fetch')
const _ = require('lodash')

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

async function fetchGraphQL(operationsDoc, operationName, variables) {
    let result = await fetch('https://api.hicdex.com/v1/graphql', {
        method: 'POST',
        body: JSON.stringify({
            query: operationsDoc,
            variables: variables,
            operationName: operationName,
        }),
    })
    return await result.json()
}

const query_creator = `
query creatorInfo($address: String!) {
    hic_et_nunc_holder(limit: 1, where: {_or: [{address: {_eq: $address}}, {name: {_eq: $address}}]}) {
      address
      name
    }
  }
`;

const query_first_market = `
query firstMarket($address: String!) {
    hic_et_nunc_swap(where: {status: {_eq: "0"}, _and: {token: {creator: {_or: [{address: {_eq: $address}}, {name: {_eq: $address}}]}}}, creator: {_or: [{address: {_eq: $address}}, {name: {_eq: $address}}]}}) {
      price
      token {
        title
        id
        display_uri
        artifact_uri
        mime
        timestamp
      }
    }
  }
`;

const query_second_market = `
query secondMarket($address: String!) {
    hic_et_nunc_swap(where: {status: {_eq: "0"}, _and: {token: {creator: {address: {_eq: $address}}}}, creator: {address: {_neq: $address}}}) {
      price
      token {
        title
        id
        display_uri
        artifact_uri
        mime
      }
    }
  }
`;

const query_avg = `
query avgPrice($address: String!) {
    hic_et_nunc_swap_aggregate(where: {token: {creator: {address: {_eq: $address}}, _and: {trades: {swap: {price: {_gt: "10000"}}}}}, trades: {amount: {_gt: "0"}}}) {
      aggregate {
        avg {
          price
        }
      }
    }
  }
`;

const query_total = `
query volume($address: String!) {
    hic_et_nunc_trade(where: {token: {creator: {address: {_eq: $address}}}}) {
      amount
      swap {
        price
      }
    }
  }
`;

const query_collectors = `
query collectors($address: String!) {
    hic_et_nunc_trade_aggregate(where: {token: {creator: {address: {_eq: $address}}}}, distinct_on: buyer_id) {
      aggregate {
        count
      }
    }
  }
`;

async function fetchCreator(addr) {
    const { errors, data } = await fetchGraphQL(
        query_creator,
        'creatorInfo',
        { address: addr }
    )
    if (errors) {
        console.error(errors)
    }
    const result = data.hic_et_nunc_holder
    // console.log({ result })
    return result
}

async function fetchFirst(addr) {
    const { errors, data } = await fetchGraphQL(
        query_first_market,
        'firstMarket',
        { address: addr }
    )
    if (errors) {
        console.error(errors)
    }
    const result = data.hic_et_nunc_swap
    return result
}

async function fetchSecond(addr) {
    const { errors, data } = await fetchGraphQL(
        query_second_market,
        'secondMarket',
        { address: addr }
    )
    if (errors) {
        console.error(errors)
    }
    const result = data.hic_et_nunc_swap
    return result
}

async function fetchAvg(addr) {
    const { errors, data } = await fetchGraphQL(
        query_avg,
        'avgPrice',
        { address : addr }
    )
    if (errors) {
        console.error(errors)
    }
    const result = data.hic_et_nunc_swap_aggregate.aggregate.avg.price
    return result
}

async function fetchTotal(addr) {
    const { errors, data } = await fetchGraphQL(
        query_total,
        'volume',
        { address : addr }
    )
    if (errors) {
        console.error(errors)
    }
    const result = data.hic_et_nunc_trade
    return result
}

async function fetchCollectors(addr) {
    const { errors, data } = await fetchGraphQL(
        query_collectors,
        'collectors',
        { address : addr }
    )
    if (errors) {
        console.error(errors)
    }
    const result = data.hic_et_nunc_trade_aggregate.aggregate.count
    return result
}

const delay = ms => new Promise(res => setTimeout(res, ms));

export default class Display extends Component {
    state = {
        address: '',
        alias: '',
        search: '',
        firstmarket: [],
        secondmarket: [],
        favorited: false,

        currentmarket: 'First',
        timedpage: true,
        volume: [],
        volumeFinal: 0,
        aprice: 0,
        collectors: 0,

        loading: true,
        banned: false,
        valid: true,

        currentObjkts: [],
        pageNumbers: [],
        firstPage: 1,
        lastPage: 0,
        currentPage: 1,
        perpage: 28,
    }

    componentDidMount = async () => {
        const creator = window.location.pathname.split('/')[2] === 'tz'
        ? decodeURI(window.location.pathname.split('/')[3])
        : decodeURI(window.location.pathname.split('/')[2]);
        // console.log(creator)

        let list = await getRestrictedAddresses()
        let blacklist = await getBlacklistedAddresses()

        const favorites = JSON.parse(localStorage.getItem('henstorefront-favorites')) || [];
        // console.log(favorites)
        const favoriteAddr = favorites.map(favorite => favorite.address)

        this.setState({ search : await fetchCreator(creator) })
        // console.log(this.state.address)

        if (this.state.search.length < 1) {
            this.setState({ address : creator, valid : false })
        }

        else if (this.state.search > 1 ) {
            this.setState({ alias : this.state.search[0].address, address : this.state.search[0].address })
        } 
        
        if (this.state.search[0].name !== '') {
            this.setState({ alias : this.state.search[0].name, address : this.state.search[0].address })
        } else {
            this.setState({ alias : creator, address : creator })
        }

        if (this.state.valid) {
            if (!list.includes(this.state.address) && !blacklist.includes(this.state.address)) {

                if (favoriteAddr.includes(this.state.address)) {
                    this.setState({ favorited : true })
                    // console.log('included')
                } else if (!favoriteAddr.includes(this.state.address)) {
                    this.setState({ favorited : false })
                    // console.log('not included')
                }

                this.setState({
                    firstmarket : await fetchFirst(this.state.address),
                    secondmarket : await fetchSecond(this.state.address),
                    aprice : await fetchAvg(this.state.address),
                    volume : await fetchTotal(this.state.address),
                    collectors : await fetchCollectors(this.state.address),
                })

                this.setState({ volumeFinal : this.state.volume.reduce((sum, trade) => sum + trade.amount * trade.swap.price, 0) / 1e6 }) 

                this.setState({ currentObjkts : this.state.firstmarket })
                this.paginate()
            } else {
                this.setState({ banned : true })
            }
        }
        await delay(1500)
        this.setState({ loading : false })
    }

    changemarket = async () => {
        this.setState({currentObjkts:[]});

        if (this.state.currentmarket !== 'First') {
            await delay(300);
            this.setState({ currentmarket : 'First' })
            // console.log(this.state.currentmarket)
        } else {
            await delay(300);
            this.setState({ currentmarket : 'Second' })
            // console.log(this.state.currentmarket)
        }

        // console.log(this.state.currentObjkts)
        this.state.currentmarket === 'First' ? this.setState({ currentObjkts : this.state.firstmarket }) : this.setState({ currentObjkts : this.state.secondmarket })
        this.setState({ currentPage : 1 })
        this.paginate()
    }

    paginate = () => {
        let placeholderObjkts = []
        var lastCount = 0
        // console.log(pageObjkts)

        for (let i = 1; i <= Math.ceil(this.state.currentObjkts.length / this.state.perpage); i++) {
            placeholderObjkts.push(i);
            lastCount += 1;
        }
        // console.log(lastCount)

        this.setState({ pageNumbers : placeholderObjkts, lastPage : lastCount })
    }

    handleClick = (e) => {
        this.setState({ currentPage: Number(e.target.id) })
        this.paginate()
    }

    addPage = () => {
        if (this.state.currentPage < this.state.lastPage) {
            this.setState({ currentPage: this.state.currentPage + 1 })
            this.paginate()
        }
    }

    subPage = () => {
        if (this.state.currentPage > this.state.firstPage) {
            this.setState({ currentPage: this.state.currentPage - 1 })
            this.paginate()
        }
    }

    addFavorite = () => {
        const existingFavorites = JSON.parse(localStorage.getItem('henstorefront-favorites')) || [];
        var entry = {
            address: this.state.address,
            name: this.state.alias,
        }

        localStorage.setItem('favorite-entry', JSON.stringify(entry));
        existingFavorites.push(entry);
        localStorage.setItem('henstorefront-favorites', JSON.stringify(existingFavorites));

        this.setState({ favorited : true })
    }

    removeFavorite = (e, addr) => {
        const currentFavorites = JSON.parse(localStorage.getItem('henstorefront-favorites'))
        const favoritesAddr = currentFavorites.map(favorite => favorite.address)
        // console.log(currentFavorites)

        const index = _.indexOf(favoritesAddr, this.state.address)
        // console.log(_.indexOf(favoritesAddr, this.state.address))
        // console.log(currentFavorites.splice(index, 1))
        currentFavorites.splice(index, 1)
        
        localStorage.setItem('henstorefront-favorites', JSON.stringify(currentFavorites))
        this.setState({ favorited : false })
    }

    render() {
        const indexOfLastObjkt = this.state.currentPage * this.state.perpage;
        const indexOfFirstObjkt = indexOfLastObjkt - this.state.perpage;
        const pageObjkts = this.state.currentObjkts.slice(indexOfFirstObjkt, indexOfLastObjkt);
        // console.log(pageObjkts, this.state.pageNumbers)

        const AveragePriceCount = Math.round((this.state.aprice / 1e6) *100) / 100;
        const CollectorCount = this.state.collectors;
        const SaleCount = this.state.firstmarket.length + this.state.secondmarket.length;

        const volumeFinal = this.state.volumeFinal

        const gateways = [
            'https://ipfs.io/ipfs/',
            'https://gateway.ipfs.io/ipfs/',
            'https://cloudflare-ipfs.com/ipfs/',
            'https://gateway.pinata.cloud/ipfs/',
        ]

        if (this.state.loading) {
            return (
                <Container>
                    <h1 className={styles.state__message}>Loading...</h1>
                </Container>
            )
        }

        if (this.state.banned) {
            return (
                <Container>
                    <h1 className={styles.state__message}>This user has been banned.</h1>
                </Container>
            )
        }

        if (this.state.valid === false) {
            return (
                <Container>
                    <h1 className={styles.state__message}>An error occurred, this was likely due to an invalid creator name in the url.</h1>
                </Container>
            )
        }
        return (
            <Container>
                <div className={styles.container__inner}>
                    <div className={styles.display__message}>
                        <div className={styles.display__regular}>
                            <h1 className={styles.display__message__top}>This is <u><a href={'https://hicetnunc.xyz/tz/' + this.state.address} target="_blank" rel="noreferrer">{this.state.alias}</a></u>.</h1>
                            <div className={styles.display__message__buttons}>
                                <h3 onClick={this.changemarket} className={styles.display__message__button}>Switch to {this.state.currentmarket === 'First' ? 'Secondary' : 'Primary'} Market</h3>

                                    {this.state.favorited
                                        ? <h3 className={styles.display__message__button} onClick={this.removeFavorite}>
                                            Remove from favorites
                                        </h3>
                                        : <h3 className={styles.display__message__button} onClick={this.addFavorite}>Add to favorites</h3>
                                    }

                                <div className={styles.display__pages}>
                                    {this.state.pageNumbers.length > 1 &&
                                        this.state.pageNumbers.map(page => (
                                            <div onClick={this.handleClick} key={page}>
                                                <h3 className={`${styles.display__page__numbers} ${this.state.currentPage === page ? styles.active : styles}`} id={page}>{page}</h3>
                                            </div>
                                        ))
                                    }
                                </div>
                                {this.state.pageNumbers.length > 1 &&
                                    <div className={styles.mobile__pages}>
                                        <h3 className={styles.display__page__numbers} id={this.state.firstPage} onClick={this.handleClick}>{this.state.firstPage}</h3>
                                        <h3 className={styles.display__page__numbers} onClick={this.subPage}>&lt;</h3>
                                        <h3 className={styles.display__page__numbers}>{this.state.currentPage}</h3>
                                        <h3 className={styles.display__page__numbers}  onClick={this.addPage}>&gt;</h3>
                                        <h3 className={styles.display__page__numbers} id={this.state.lastPage} onClick={this.handleClick}>{this.state.lastPage}</h3>
                                    </div>                            
                                }
                            </div>
                        </div>
                        <div className={styles.trade__data}>
                            <ResponsiveMasonry>
                                <Card>
                                    <h2>Volume Traded:</h2>
                                    <h3 style={{ marginTop: 0, textAlign: 'center' }}>{volumeFinal} XTZ</h3>
                                </Card>
                                <Card>
                                    <h2>Average Price:</h2>
                                    <h3 style={{ marginTop: 0, textAlign: 'center' }}>{AveragePriceCount} XTZ</h3>
                                </Card>
                                <Card>
                                    <h2>Collectors:</h2>
                                    <h3 style={{ marginTop: 0, textAlign: 'center' }}>{CollectorCount}</h3>
                                </Card>
                                <Card>
                                    <h2>On Sale:</h2>
                                    <h3 style={{ marginTop: 0, textAlign: 'center' }}>{SaleCount}</h3>
                                </Card>
                            </ResponsiveMasonry>
                        </div>
                    </div>
                    <div>
                        <div className={styles.objkts__cards}>
                            <ResponsiveMasonry>
                                {pageObjkts.map((objkt, index) => (
                                    <a href={'https://hicetnunc.xyz/objkt/' + objkt.token.id } target="_blank" rel="noreferrer" key={objkt.token.id * index}>
                                        <Card>
                                            {objkt.token.display_uri !== ''
                                                ? <LazyLoadImage placeholder={<div className={styles.placeholder}><h1>Loading...</h1></div>} wrapperClassName={styles.display__cover} src={gateways[0] + objkt.token.display_uri.split('//')[1]} alt={objkt.token.title}/>
                                                : objkt.token.mime.split('/')[0] === 'image'
                                                ? <LazyLoadImage placeholder={<div className={styles.placeholder}><h1>Loading...</h1></div>} wrapperClassName={styles.display__cover} src={gateways[0] + objkt.token.artifact_uri.split('//')[1]} alt={objkt.token.title}/>
                                                : objkt.token.mime.split('/')[0] === 'video'
                                                ? <div className={styles.display__cover}>
                                                    <video src={gateways[0] + objkt.token.artifact_uri.split('//')[1]} alt={objkt.token.title} autoPlay="autoplay" muted loop loading="lazy" />
                                                </div>
                                                : <div className={styles.placeholder}>Mimetype Not Supported.</div>
                                            }
                                            <h3 className={styles.objkt__titles}>{objkt.token.title}</h3>
                                            <h4 className={styles.objkt__data}>OBJKT {objkt.token.id} | {objkt.price / 1e6} XTZ</h4>
                                        </Card>
                                    </a>
                                ))}
                            </ResponsiveMasonry>
                        </div>
                    </div>
                </div>
            </Container>
        )
    }
}