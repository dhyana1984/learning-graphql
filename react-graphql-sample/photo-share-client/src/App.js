import React from 'react'
import Users from './User'
import { gql } from 'apollo-boost'
import { BrowserRouter } from 'react-router-dom'
import AuthorizedUser from './AuthorizedUser'

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

const App = () => (
  <BrowserRouter>
    <div>
      <AuthorizedUser />
      <Users />
    </div>
  </BrowserRouter>)

export default App
