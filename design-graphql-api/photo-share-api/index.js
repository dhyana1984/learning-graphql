const { ApolloServer } = require('apollo-server')

/*
 * Define the query type schema, it's pure string 
 */
const typeDefs = `
    # define totalPhotos query field
    # type Query {
    #    totalPhotos: Int!
    # }

    # defile postPhoto mutation field
    type Mutation {
        postPhoto(name: String! description: String): Photo!
    }

    type Photo {
        id: ID!
        url: String!
        name: String!
        description: String
    }

    type Query{
        totalPhotos: Int!
        allPhotos: [Photo!]!
    }
`

/*
 * Declare the resolver, the query type name and return type must the same as schema 
 * Each field in schema should have a resolver
 */

const photos = []
let _id = 0
const resolvers = {
    // Query: {
    //     totalPhotos: () => photos.length
    // },
    Query: {
        totalPhotos: () => photos.length,
        allPhotos: () => photos
    },
    Mutation: {
        /*
         *  postPhoto is defined under Mutation, so postPhoto is a root resolver
         *  parent is always the first argument of resolver, here parent point to "Mutation"
         */
        postPhoto(parent, args) {
            const newPhoto = {
                id: _id++,
                /*
                 * url field could be assigned value here 
                 */
                // url: `http://mysite/img/${_id}.jpg`,
                ...args
            }
            photos.push(newPhoto)
            return newPhoto
        }
    },
    /*
     *  Add Photo object to resolver list and define the field mapping
     *  Here url field is resolved by a function. The Photo resolver is a trivial resolver 
     *  Parent is "Photo" object that is resolving
     */
    Photo: {
        url: parent => `http://mysite/img/${parent.id}.jpg`
    }
}

/*
 * Run Apollo Server, the arguments are schema field defination and resolver
 */
const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => console.log(`GraphQL Service running on ${url}`))