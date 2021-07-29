import React, { createContext, Component } from 'react'
import { withRouter } from 'react-router'
import { setItem } from '../utils/storage'

export const StorefrontContext = createContext()

class StorefrontContextProviderClass extends Component {
    constructor(props) {
        super(props)

        this.state = {
            theme: 'light',
            setTheme: (theme) => {
                let root = document.documentElement

                const light = theme === 'light'

                setItem('theme', light ? 'light' : 'dark')

                root.style.setProperty(
                    '--background-color',
                    light ? '#FFF9FB' : '#0A0A0B'
                )
                root.style.setProperty('--primary-color', light ? '#0A0A0B' : '#FFF9FB')
                root.style.setProperty(
                    '--shadow-color',
                    light ? 'rgba(0,0,0, 0.7)' : 'rgba(255,255,255,0.6)'
                )

                this.setState({ theme })
            }
        }
    }
    render() {
        return (
            <StorefrontContext.Provider
                value={{
                    ...this.state,
                }}
            >
                {this.props.children}
            </StorefrontContext.Provider>
        )
    }
}

const StorefrontContextProvider = withRouter(StorefrontContextProviderClass)
export default StorefrontContextProvider