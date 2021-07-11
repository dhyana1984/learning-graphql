import React, { Component } from 'react'
import Users from './User'
import { gql } from 'apollo-boost'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import AuthorizedUser from './AuthorizedUser'
import { withApollo } from 'react-apollo'
import { Fragment } from 'react'
import Photos from './Photos'
import PostPhoto from './PostPhoto'

/*
 *  ROOT_QUERY is a query field. We need to create the query field on UI demond
 *  We use gql function to translate the GraphQL query string to a AST and export it
 */
export const ROOT_QUERY = gql`
  query allUsers{
    totalUsers,
    totalPhotos
    allUsers{...userInfo}
    me{...userInfo}
    allPhotos{
      id
      name
      url
    }
  }

  fragment userInfo on User {
    githubLogin
    name
    avatar
  }
`

const LISTEN_FOR_PHOTOS = gql`
    subscription {
        newPhoto {
            id
            name
            url
        }
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

    this.listenForPhotos = client
      .subscribe({ query: LISTEN_FOR_PHOTOS })
      .subscribe(({ data: { newPhoto } }) => {
        let data = client.readQuery({ query: ROOT_QUERY })
        const totalPhotos = data.totalPhotos + 1
        const allPhotos = [
          ...data.allPhotos,
          newPhoto
        ]
        data = {
          ...data,
          totalPhotos,
          allPhotos
        }
        client.writeQuery({ query: ROOT_QUERY, data })
      })
  }

  componentWillUnmount() {
    this.listenForUsers.unsubscribe()
    this.listenForPhotos.unsubscribe()
  }

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route
            exact
            path="/"
            component={() => (
              <Fragment>
                <AuthorizedUser />
                <Users />
                <Photos />
              </Fragment>
            )}
          />
          <Route
            path="/newPhoto"
            component={PostPhoto}
          />
          <Route
            component={({ locaiton }) => (
              <h1>"{locaiton.pathname}" not found</h1>
            )}
          />
        </Switch>
      </BrowserRouter>)
  }
}



export default withApollo(App)
