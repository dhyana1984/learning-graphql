const { request } = require('graphql-request')

const mutation = `
                query listUsers{
                    allUsers{
                    name
                    avatar
                    }
                }`
const url = 'http://localhost:4000/graphql'

/* 
 * Send request to GraphQL service via graphql-request
 */
request(url, query)
    .then(console.log)
    .catch(console.error)

