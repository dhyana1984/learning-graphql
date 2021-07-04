const { request } = require('graphql-request')

const mutation = `
                mutation populate($count: Int){
                    addFakeUsers(count: $count){
                        githubLogin
                        name
                    }
                  }`
const variables = { count: 3 }

const url = 'http://localhost:4000/graphql'

/* 
 * Send request to GraphQL service via graphql-request
 * The 3rd parameter is the JavaScript object
 */
request(url, mutation, variables)
    .then(console.log)
    .catch(console.error)

