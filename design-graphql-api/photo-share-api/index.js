const { MongoClient } = require('mongodb')
require('dotenv').config()
const { ApolloServer } = require('apollo-server-express')
const expressPlayGround = require('graphql-playground-middleware-express').default
const express = require('express')
const { readFileSync } = require('fs')

/*
 *  Read schema file  
 */
const typeDefs = readFileSync('./typeDefs.graphql', 'utf-8')
const resolvers = require('./resolver')

async function start() {
    const app = express()
    // Reading the .env config for MongoDB connect string
    const MONGO_DB = process.env.DB_HOST
    const client = await MongoClient.connect(
        MONGO_DB,
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    const db = client.db()
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        // context could be a object or a function
        context: async ({ req }) => {
            const githubToken = req.headers.authorization
            const currentUser = await db.collection('users').findOne({ githubToken })
            return { db, currentUser }
        }
    })
    const context = { db }

    /*
     *  Create apollo express service, the mongodb client is argument as global object. 
     */


    server.applyMiddleware({ app })

    /*
 * This is the primary route: http://localhost:4000/ 
 */
    app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'))

    /*
     * To customize a route for GrouphQL Playground, the package 'graphql-playground-middleware-express' suport this function
     * This is Playground route: http://localhost:4000/playground
     */
    app.get('/playground', expressPlayGround({ endpoint: '/graphql' }))

    /*
     * The default GrouphQL service route:  http://localhost:4000/graphql
     */
    app.listen({ port: 4000 }, () => console.log(`GraphQL server running @ http://localhost:4000${server.graphqlPath}`))
}

start()







