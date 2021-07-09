import React, { Component } from 'react'
import Users from './User'
import { gql } from 'apollo-boost'
import { BrowserRouter } from 'react-router-dom'
import AuthorizedUser from './AuthorizedUser'
import { withApollo } from 'react-apollo'

/*
 *  ROOT_QUERY is a query field. We need to create the query field on UI demond
 *  We use gql function to translate the GraphQL query string to a AST and export it
 */
export const ROOT_QUERY = gql`
  query allUsers{
    totalUsers
    allUsers{...userInfo}
    me{...userInfo}
  }

  fragment userInfo on User {
    githubLogin
    name
    avatar
  }
`

const LISTEN_FOR_USERS = gql`
    subscription {
        newUser {
            githubLogin
            name
            avatar
        }
    }
`

class App extends Component {

  componentDidMount() {
    let { client } = this.props
    this.listenForUsers = client
      .subscribe({ query: LISTEN_FOR_USERS })
      .subscribe(({ data: { newUser } }) => {
        let data = client.readQuery({ query: ROOT_QUERY })
        const totalUsers = data.totalUsers + 1
        const allUsers = [
          ...data.allUsers,
          newUser
        ]
        data = {
          ...data,
          totalUsers,
          allUsers
        }
        client.writeQuery({ query: ROOT_QUERY, data })
      })
  }

  componentWillUnmount() {
    this.listenForUsers.unsubscribe()
  }

  render() {
    return (
      <BrowserRouter>
        <div>
          <AuthorizedUser />
          <Users />
        </div>
      </BrowserRouter>)
  }
}



export default withApollo(App)
