import React from 'react'
import { render } from 'react-dom'
import App from './App'
import { ApolloProvider } from 'react-apollo'
import ApolloClient from 'apollo-boost'

const uri = 'http://localhost:4000/graphql'
const client = new ApolloClient({
    uri,
    request: operation => {
        operation.setContext(context => ({
            /*
             * Add authorization to header for each request
             */
            headers: {
                ...context.headers,
                authorization: localStorage.getItem('token')
            }
        }))
    }

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