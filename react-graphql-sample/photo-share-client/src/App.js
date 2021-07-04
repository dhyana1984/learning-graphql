import React from 'react'
import Users from './User'
import { gql } from 'apollo-boost'

/*
 *  ROOT_QUERY is a query field. We need to create the query field on UI demond
 *  We use gql function to translate the GraphQL query string to a AST and export it
 */
export const ROOT_QUERY = gql`
  query allUsers{
    totalUsers
    allUsers{
      githubLogin
      name
      avatar
    }
  }
`

const App = () => <Users />

export default App
