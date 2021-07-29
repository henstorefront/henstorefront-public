import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../../components/container'
import { ResponsiveMasonry } from '../../components/responsive-masonry'
import { Card } from '../../components/card'
import styles from './styles.module.scss'

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

const query_count = `
query count {
    hic_et_nunc_holder_aggregate(where: {address: {_nin: ["KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW", "KT1My1wDZHDGweCrJnQJi3wcFaS67iksirvj", "KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9", "KT18xby6bb1ur1dKe7i6YVrBaksP4AgtuLES", "KT1WbY7vTYx1vbgG7PkKgHwcw87Vz781ydmg"]}, _and: {hdao_balance: {_gt: "0"}, name: {_neq: ""}, holders_token: {quantity: {_gt: "0"}}}}) {
      aggregate {
        count
      }
    }
  }  
`;

const query_random = `
query random($offset: Int = "") {
    hic_et_nunc_holder(offset: $offset, limit: 1, where: {address: {_nin: ["KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW", "KT1My1wDZHDGweCrJnQJi3wcFaS67iksirvj", "KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9", "KT18xby6bb1ur1dKe7i6YVrBaksP4AgtuLES", "KT1WbY7vTYx1vbgG7PkKgHwcw87Vz781ydmg"]}, _and: {hdao_balance: {_gt: "0"}, name: {_neq: ""}, holders_token: {quantity: {_gte: "1"}}}}) {
      name
      address
    }
  }  
`;
const query_objkt_count = `
query objkts {
    hic_et_nunc_token(limit: 1, order_by: {timestamp: desc}) {
      id
    }
  }
`;

const query_new_creator = `
query least_sales {
    hic_et_nunc_holder(where: {sales: {amount: {_lte: "10"}}, _and: {name: {_neq: ""}}}, limit: 1, order_by: {sales_aggregate: {count: asc}}) {
      address
      name
    }
  }  
`;

async function fetchCount() {
    const { errors, data } = await fetchGraphQL(
        query_count,
        'count',
    )
    if (errors) {
        console.error(errors) 
    }
    const result = data.hic_et_nunc_holder_aggregate.aggregate
    return result
}

async function fetchRandom(off) {
    const { errors, data } = await fetchGraphQL(
        query_random,
        'random',
        { offset: off },
    )
    if (errors) {
        console.error(errors)
    }
    const result = data.hic_et_nunc_holder
    return result
}

async function fetchNewCreator() {
    const { errors, data } = await fetchGraphQL(
        query_new_creator,
        'least_sales',
    )
    if (errors) {
        console.error(errors)
    }
    const result = data.hic_et_nunc_holder
    return result
}

async function fetchObjktCount() {
    const { errors, data } = await fetchGraphQL(
        query_objkt_count,
        'objkts',        
    )
    if (errors) {
        console.error(errors)
    }
    const result = data.hic_et_nunc_token[0].id
    return result
}

export default class Welcome extends Component {

    state = {
        topRaw: '',
        topCleaned: {},
        topCreator: '',

        countCreator: 0,
        creatorData: '',
        randomCreator: '',

        newCreatorData: '',
        newCreator: '',

        objktCount: 0,

        featuredCreator: '',
        currentObjkt: 0,
        highestSale: 0,
        mostEditions: 0,
    }

    componentDidMount = async () => {
        this.setState({ topRaw: await fetchTop() })
        this.clean()

        this.randomize()

        this.setState({ objktCount : await fetchObjktCount() })

        this.getNewCreator()
    }

    getNewCreator = async () => {
        let list = await getRestrictedAddresses()
        let blacklist = await getBlacklistedAddresses()

        this.setState({ newCreatorData : await fetchNewCreator() })

        if (!list.includes(this.state.newCreatorData[0].address) && !blacklist.includes(this.state.newCreatorData[0].address)) {
            this.setState({ newCreator : this.state.newCreatorData[0].name })
        } else {
            this.getNewCreator()
        }
    }

    randomize = async () => {
        let list = await getRestrictedAddresses()
        let blacklist = await getBlacklistedAddresses()
        this.setState({ countCreator : await fetchCount() })
        // console.log(this.state.countCreator)

        const offset = Math.floor((Math.random() * this.state.countCreator.count) + 1);

        // console.log(offset)
        
        this.setState({ creatorData : await fetchRandom(offset) })

        if (!list.includes(this.state.creatorData[0].address) && !blacklist.includes(this.state.creatorData[0].address)) {
            this.setState({ randomCreator : this.state.creatorData[0].name })
        } else {
            this.randomize()
        }
    }

    clean = async () => {
        let list = await getRestrictedAddresses()
        let blacklist = await getBlacklistedAddresses()
        // console.log(blacklist)

        let cleanedArray = this.state.topRaw.filter(function(creator) {
            return !list.includes(creator.address) && !blacklist.includes(creator.address);
        })
        const shortenedArray = cleanedArray.slice(0, 1)

        this.setState({ topCleaned : shortenedArray })

        // console.log(cleanedArray);
        // console.log(shortenedArray);

        if (this.state.topCleaned.name !== '') {
            this.setState({ topCreator : this.state.topCleaned[0].name })
            // console.log('name exists')
        } else {
            this.setState({ topCreator : this.state.topCleaned[0].address })
            // console.log('name does not exist')
        }
    }

    render() {
        return (
            <Container>
                <div className={styles.welcome}>
                    <div className={styles.welcome__message}>
                        <h1>
                            You can find useful tools in and around this website,
                            <br />
                            go ahead and explore.
                        </h1>
                    </div>
                    
                    <div className={styles.card__container}>
                        <ResponsiveMasonry>
                            <Link to={this.state.topCleaned.name !== '' ? '/storefront/' + this.state.topCreator : '/storefront/tz/' + this.state.topCreator}>
                                <Card title="Top Creator:">
                                    <h1>{this.state.topCreator} is the top creator on hen by first-market.</h1>
                                </Card>
                            </Link>
                            <Link to={'/storefront/' + this.state.randomCreator}>
                                <Card title="Featured Creator">
                                    <h1>{this.state.randomCreator} is the randomized feature for your visit. They hold more than 0 hDAO.</h1>
                                </Card>
                            </Link>
                            <Link to={'/storefront/' + this.state.newCreator}>
                                <Card title="New Creator">
                                    <h1>{this.state.newCreator} is one of the newest creators on hen, visit their storefront to show your support.</h1>
                                </Card>
                            </Link>
                            <a href={'https://hicetnunc.xyz/objkt/' + this.state.objktCount} target="_blank" rel="noreferrer">
                                <Card title="OBJKTs Minted">
                                    <h1>{this.state.objktCount} OBJKTS have been minted on hic et nunc so far.</h1>
                                </Card>
                            </a>
                            <a href="https://hicetnunc.xyz/" target="_blank" rel="noreferrer">
                                <Card>
                                    <h1>Inspired by <a href="https://twitter.com/hicetnunc2000"><u>hicetnunc</u></a></h1>
                                </Card>
                            </a>
                            <a href="https://twitter.com/mknol" target="_blank" rel="noreferrer">
                                <Card>
                                    <h1>Inspired by <a href="https://twitter.com/mknol"><u>mark knol's</u></a> discovery tool.</h1>
                                </Card>
                            </a>
                            <Link to='/storefront/[homework]punks'>
                                <Card title="Support Me" special>
                                    <h1>Consider purchasing an OBJKT from <Link to="/storefront/[homework]punks">my storefront</Link></h1>
                                </Card>
                            </Link>
                            <a href="https://twitter.com/homeworkpunks" target="_blank" rel="noreferrer">
                                <Card title="Future Storefront">
                                    <h1>
                                        This website is still in development, suggest and give feedback to <a href="https://twitter.com/homeworkpunks"><u>@homeworkpunks</u></a> on Twitter.
                                    </h1>
                                </Card>
                            </a>
                            <a href="https://hennycomb.glitch.me/" target="_blank" rel="noreferrer">
                                <Card>
                                    <h1>Inspired by <a href="https://twitter.com/secondcass"><u>secondcass's</u></a> collector watch tool.</h1>
                                </Card>
                            </a>

                            <a href="https://hicdex.com" target="_blank" rel="noreferrer">
                                <Card>
                                    <h1>Powered by <u>hicdex</u>.</h1>
                                </Card>
                            </a>
                        </ResponsiveMasonry>
                    </div>
                </div>
            </Container>
        )
    }

}