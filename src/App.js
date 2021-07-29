import React from 'react'
import { Switch, Route } from 'react-router-dom'
import StorefrontContextProvider from './context/StorefrontContext'
import { Header } from './components/header'
import { Footer } from './components/footer'
import { routes } from './routes'

const App = () => (
  <StorefrontContextProvider>
    <Header />
    <Footer />
    <Switch>
      {routes.map(({ exact, path, component: Comp }) => (
        <Route path={path} exact={exact} key={path} component={Comp} />
      ))}
    </Switch>
  </StorefrontContextProvider>
)

export default App