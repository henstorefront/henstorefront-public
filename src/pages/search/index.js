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

const query_creator = `
query creatorInfo($address: String!) {
    hic_et_nunc_holder(limit: 1, where: {_or: [{address: {_eq: $address}}, {name: {_eq: $address}}]}) {
      address
      name
    }
  }
`;

const query_tezdomain = `
query ResolveDomain($address: String!) {
    domain(name: $address) {
      address
    }
  }
`

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

async function fetchDomainGraphQL(operationsDoc, operationName, variables) {
    let result = await fetch('https://api.tezos.domains/graphql', {
        headers: {
            'content-type': 'application/json',
        },
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
            query: operationsDoc,
            variables: variables,
            operationName: operationName,
        }),
    })
    return await result.json()
}

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

async function fetchTezDomain(addr) {
    try {
            const { data } = await fetchDomainGraphQL(
            query_tezdomain,
            'ResolveDomain',
            { address: addr }
        )
        const result = data.domain
        // console.log({ result })
        return result
    } catch(err) { }
    return '';
}

export default class Search extends Component {
    state = {
        address: '',
        search: '',
        alias: '',
        wallet: '',
        domainsearch: '',
        redirect: false,
        invalid: false,
        emptycall: false,
        loading: false,
        banned: false,
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    search = async () => {
        let list = await getRestrictedAddresses()
        let blacklist = await getBlacklistedAddresses()

        if (this.state.address.split('.')[1] === 'tez') {
            this.setState({ domainsearch : await fetchTezDomain(this.state.address) })
            if (this.state.domainsearch === null) {
                this.setState({ invalid : true, empty : false, banned : false })
            } else if (this.state.domainsearch !== null) {
                if (list.includes(this.state.domainsearch)) {
                    this.setState({ banned : true, emptycall : false, invalid : false })
                } else {
                    this.setState({ wallet : this.state.domainsearch.address, redirect : true })
                }
            }
        } else if (!list.includes(this.state.address) && !blacklist.includes(this.state.address)) { //check for ban

            if (this.state.address.length < 1) { //check for empty submit
                this.setState({ redirect : false, banned : false, invalid : false, emptycall : true })

            } else if (this.state.address.length >= 1) { //if not empty call hicdex
                this.setState({ emptycall : false })
                this.setState({ search : await fetchCreator(this.state.address)})

                if (this.state.search.length < 1) { //check for invalid alias/address through call response
                    this.setState({ redirect : false, banned : false, invalid : true })
                } else {
                    this.setState({ invalid : false })

                    if (this.state.search[0].name !== '') { //check if subjkt is set
                        this.setState({ redirect : true, alias : this.state.search[0].name }) //if it is set, set subjkt to alias
                    } else {
                        this.setState({ wallet : this.state.search[0].address, redirect : true, loading : false })
                    }
                }
            }
        } else if (list.includes(this.state.address) || blacklist.includes(this.state.address)) {
            this.setState({ redirect : false, emptycall : false, invalid : false, banned : true })
        }



        if (this.state.redirect === true) {
            if (this.state.alias !== '') {
                this.props.history.push(`/storefront/${this.state.alias}`)
            } else {
                this.props.history.push(`/storefront/tz/${this.state.wallet}`)
            }
        }
        

    }

    render() {
        return (
            <Container>
                <div className={styles.search}>
                    <div className={styles.search__message}>
                        <h1>
                            Search for all your favorite Creators here.
                            <br />
                            When you find them, you'll be sent to their storefront.
                        </h1>
                    </div>
                    <div className={styles.search__container}>
                        <div className={styles.search__bar}>
                            <input
                                className={styles.search__term}
                                type="text"
                                name="address"
                                onChange={this.handleChange}
                                placeholder="Search for your Favorite Creators..."
                            ></input>
                            <button onClick={this.search} className={styles.search__button}>Find</button>
                        </div>
                        <div className={styles.search__errors}>
                            { this.state.emptycall ? (
                                <div>Nothing was entered into the search field.</div>
                            ) : null }
                            { this.state.invalid ? (
                                <div>The entered search is not valid. Try searching with a Creator's SUBJKT or Tezos address.</div>
                            ) : null }
                            { this.state.banned ? (
                                <div>This user has been banned.</div>
                            ) : null }
                        </div>
                    </div>
                </div>
            </Container>
        )
    }
}