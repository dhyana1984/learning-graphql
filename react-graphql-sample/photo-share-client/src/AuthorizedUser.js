import { gql } from 'apollo-boost'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { CLIENT_ID } from './config'
import { Mutation, withApollo } from 'react-apollo'
import { flowRight as compose } from 'lodash'
import { ROOT_QUERY } from './App'
import Me from './Me'

const GITHUB_AUTH_MUTATION = gql`
    mutation githubAuth($code: String!){
        githubAuth(code: $code){
            token
        }
    }
`

class AuthorizedUser extends Component {
    state = { signingIn: false }

    authorizationComplete = (cache, { data }) => {
        localStorage.setItem('token', data.githubAuth.token)
        this.props.history.replace('/')
        this.setState({ signingIn: false })
    }

    componentDidMount() {
        if (window.location.search.match(/code=/)) {
            this.setState({ signingIn: true })
            /*
             * Get the code in call back url
             */
            const code = window.location.search.replace("?code=", "")
            this.githubAuthMutation({ variables: { code } })
            /*
             * props.history is from withRouter, delete the code in url
             */
            this.props.history.replace('/')
        }
    }

    requestCode() {
        window.location = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=user`
    }

    logout = () => {
        localStorage.removeItem('token')
        /*
         *  new this.props.client is Apollo's cache, compose(withApollo, withRouter)(AuthorizedUser) pass client to props
         */
        const data = this.props.client.readQuery({ query: ROOT_QUERY })
        const me = null
        /*
         * Note here we need to pass a new object as data's value then React will update UI 
         */
        this.props.client.writeQuery({ query: ROOT_QUERY, data: { ...data, me } })
    }

    render() {
        return (
            <Mutation
                mutation={GITHUB_AUTH_MUTATION}
                /*
                 * update property is the callback function of mutation 
                 */
                update={this.authorizationComplete}
                refetchQueries={[{ query: ROOT_QUERY }]}
            >
                {
                    mutation => {
                        /*
                         * save GITHUB_AUTH_MUTATION mutation
                         */
                        this.githubAuthMutation = mutation
                        return (
                            <Me
                                signingIn={this.state.signingIn}
                                requestCode={this.requestCode}
                                logout={this.logout}
                            />
                        )
                    }
                }
            </Mutation>

        )
    }
}

export default compose(withApollo, withRouter)(AuthorizedUser)