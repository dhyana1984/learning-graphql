const { MongoClient } = require('mongodb')
require('dotenv').config()
const { ApolloServer, PubSub } = require('apollo-server-express')
const expressPlayGround = require('graphql-playground-middleware-express').default
const express = require('express')
const { readFileSync } = require('fs')
const { createServer } = require('http')
const path = require('path')
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
    const pubsub = new PubSub()
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        // context could be a object or a function
        context: async ({ req, connection }) => {
            /*
             * In subscription, there is no http request, so req is null
             * So we need to use connection.context to get the Authorization in header
             */
            const githubToken = req ? req.headers.authorization : connection.context.Authorization
            const currentUser = await db.collection('users').findOne({ githubToken })
            return { db, currentUser, pubsub }
        }
    })

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
    // app.listen({ port: 4000 }, () => console.log(`GraphQL server running @ http://localhost:4000${server.graphqlPath}`))

    /*
     * Use static middleware to map /img/photos to assets/photos folder 
     */
    app.use(
        '/img/photos',
        express.static(path.join(__dirname, 'assets', 'photos'))
    )

    /*
     *  httpServer is created from Express to handle http request
     */
    const httpServer = createServer(app)
    /*
     * server is a Apollo server and here is for supporting subscription
     */
    server.installSubscriptionHandlers(httpServer)
    httpServer.listen({ port: 4000 }, () => console.log(`GraphQL server running at http://localhost:4000${server.graphqlPath}`))
}

start()







