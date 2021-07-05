import { gql } from 'apollo-boost'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { CLIENT_ID } from './config'
import { Mutation } from 'react-apollo'
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
                                logout={() => localStorage.removeItem('token')}
                            />
                        )
                    }
                }
            </Mutation>

        )
    }
}

export default withRouter(AuthorizedUser)