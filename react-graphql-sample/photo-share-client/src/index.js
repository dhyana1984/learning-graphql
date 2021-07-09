import React from 'react'
import { render } from 'react-dom'
import App from './App'
import { ApolloProvider } from 'react-apollo'
import { InMemoryCache, HttpLink, ApolloLink, ApolloClient, split } from 'apollo-boost'
import { persistCache } from 'apollo-cache-persist'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

/*
 * Create cache instance
 */
const cache = new InMemoryCache()

/*
 * Map cache instance and storage(we use localStorage as storage here) 
 */
persistCache({
    cache,
    storage: localStorage
})

/*
 * If there is cache data, restore to cache instance
 */
if (localStorage['apollo-cache-persist']) {
    let cacheData = JSON.parse(localStorage['apollo-cache-persist'])
    cache.restore(cacheData)
}

const httpUri = 'http://localhost:4000/graphql'
const wsUri = 'ws://localhost:4000/graphql'

/*
 *  HttpLink handle Query and Mutation request with HTTP request
 */
const httpLink = new HttpLink({ uri: httpUri })

/* 
 *  WebSocketLink handle Subscription
 */
const wsLink = new WebSocketLink({ uri: wsUri, options: { reconnect: true } })

const authLink = new ApolloLink((operation, forward) => {
    operation.setContext(context => ({
        headers: {
            ...context.headers,
            authorization: localStorage.getItem('token')
        }
    }))
    return forward(operation)
})

/*
 *  concat here is not the same as Array concat function, authLink.concat is a special function for ApolloLink
 *  the request will go through authLink first, and add autorization header, then go through httpLink
 *  we can use it to link multiple Apollo link as Express or Redux middleware
 */
const httpAuthLink = authLink.concat(httpLink)

/*
 * split function is used to distinguish the request based on http or websocket 
 * the first argument of split function is predicate, if return true, the second argument Apollo link will work
 * if return false, the third arugument apollo link will work
 */
const link = split(
    ({ query }) => {
        const { kind, operation } = getMainDefinition(query)
        return kind === 'OperationDefinition' && operation === 'subscription'
    },
    wsLink,
    httpAuthLink
)

const client = new ApolloClient({
    cache,
    link
})

/*
 * We set the Apollo client as the client prop of <ApolloProvider> to make the client as a global variable
 * So all the component including App component could send request to GraphQL service
 */
render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>,
    document.getElementById('root')
)