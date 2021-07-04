import ApolloClient, { gql } from 'apollo-boost'

const uri = 'http://localhost:4000/graphql'
const client = new ApolloClient({ uri })

/*
 * gql function is used to resolve the query string to AST 
 */
const query = gql(`
  {
    totalUsers
    totalPhotos
  }
`)

const fetchData = async () => {
  try {
    /*
     *  We use client.extract() to get the cache data
     *  client.extract() will return null because there is no cache here
     */
    console.log('cache', client.extract())
    /*
     *  client.query will send the request to GraphQL service and return a promise object
     */
    const result = await client.query({ query })
    console.log('data', result.data)
    /*
     *  Now we can see the cache via client.extract()
     *  If we send request with the same query, client will return data from cache directly
     */
    console.log('cache', client.extract())
  } catch (error) {
    console.error(error)
  }
}

fetchData()
