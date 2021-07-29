import Welcome from './pages/welcome'
import Display from './pages/display'
import Search from './pages/search'
import Random from './pages/random'
import Top from './pages/top'
import Favorites from './pages/favorites'
import { Contact } from './pages/contact'

export const routes = [
    {
        exact: true,
        path: '/',
        component: Welcome,
    },
    {
        exact: true,
        path: '/search',
        component: Search,
    },
    {
        exact: false,
        path: '/storefront/:id',
        component: Display,
    },
    {
        exact: false,
        path: '/storefront/tz/:id',
        component: Display,
    },
    {
        exact: true,
        path: '/random',
        component: Random,
    },
    {
        exact: true,
        path: '/top',
        component: Top,
    },
    {
        exact: true,
        path: '/favorites',
        component: Favorites,
    },
    {
        exact: true,
        path: '/contact',
        component: Contact,
    }
]