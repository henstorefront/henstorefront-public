import React, { Component } from 'react'
import { Container } from '../../components/container'
import styles from './styles.module.scss'

const axios = require('axios')
const fetch = require('node-fetch')

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

const delay = ms => new Promise(res => setTimeout(res, ms));

export default class Random extends Component {
    state = {
        countCreator: 0,
        creatorData: '',
        randomCreator: '',
        redirect: false,
    }

    componentDidMount = async () => {
        let list = await getRestrictedAddresses()
        let blacklist = await getBlacklistedAddresses()
        this.setState({ countCreator : await fetchCount() })
        // console.log(this.state.countCreator)

        const offset = Math.floor((Math.random() * this.state.countCreator.count) + 1);

        // console.log(offset)
        
        this.setState({ creatorData : await fetchRandom(offset) })

        if (!list.includes(this.state.creatorData[0].address) && !blacklist.includes(this.state.creatorData[0].address)) {
            this.setState({ randomCreator : this.state.creatorData[0].name })
            await delay(3000)
    
            this.setState({ redirect : true })
    
            await delay(3000)
            if (this.state.redirect === true) {
                this.props.history.push(`/storefront/${this.state.randomCreator}`)
            }
        } else {
            this.props.history.push(`/random`)
        }
    }

    render() {
        return (
            <Container>
                <div className={styles.redirect__message}>
                    {this.state.redirect ? <h1 className={`${styles.animate__state} ${this.state.redirect ? styles.active : styles}`}>Going to {this.state.randomCreator}'s Storefront.</h1> : <h1 className={`${styles.animate__state} ${this.state.redirect ? styles.active : styles}`}>Picking A Creator...</h1>}
                </div>
            </Container>
        )
    }
}