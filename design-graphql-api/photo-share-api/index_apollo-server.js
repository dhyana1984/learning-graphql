const { ApolloServer } = require('apollo-server')
const { GraphQLScalarType } = require('graphql')

/*
 * Define the query type schema, it's pure string 
 */
const typeDefs = `
    # define totalPhotos query field
    # type Query {
    #    totalPhotos: Int!
    # }

    # The enum type  of category field of Photo type
    enum PhotoCategory {
        SELFIE
        PORTRAIT
        ACTION
        LANDSCAPE
        GRAPHIC
    }

    # Customized standard type, use "scalar"
    scalar DateTime

    type User {
        githubLogin: ID!
        name: String
        avatar: String
        postedPhotos: [Photo!]! # one to multiple 
        inPhotos:[Photo!]! # multiple to multiple 
    }

    type Photo {
        id: ID!
        url: String!
        name: String!
        description: String
        category: PhotoCategory!
        postedBy: User! # one to multiple 
        taggedUsers:[User!]! # multiple to multiple 
        created:DateTime!
    }

    # input type is used to define the input arguments as a customized type
    # Here PostPhotoInput is a input type for the argument of postPhoto in Mutation
    # please note the default value of category is PORTRAIT enum value
    input PostPhotoInput{
        name: String!
        category: PhotoCategory = PORTRAIT
        description: String
        githubUser: String!
    }

    # defile postPhoto mutation field
    type Mutation {
        postPhoto(input: PostPhotoInput!): Photo!
    }

    # define totalPhotos query field
    type Query{
        totalPhotos: Int!
        allPhotos(after: DateTime): [Photo!]!
        allUsers:[User!]!
    }
`

/*
 * Declare the resolver, the query type name and return type must the same as schema 
 * Each field in schema should have a resolver
 */
// const photos = []
let _id = 0
const users = [
    { githubLogin: "aaa", name: "Jack" },
    { githubLogin: "bbb", name: "Tom" },
    { githubLogin: "ccc", name: "Bob" }
]
const photos = [
    {
        id: "1",
        name: "Dropping the heart Chute",
        description: "The heart chute is one of my favorite chute",
        category: "ACTION",
        githubUser: "bbb",
        created: '3-28-1977'
    },
    {
        id: "2",
        name: "Enjoying the sunshine",
        category: "SELFIE",
        githubUser: "ccc",
        created: '1-2-1985'
    },
    {
        id: "3",
        name: "Gunbarrel 25",
        description: "25 laps on gunbarrel today",
        category: "LANDSCAPE",
        githubUser: "bbb",
        created: '2018-04-15T19:09:57.308Z'
    },
]
/*
 * This is a middle table that no need to create schema for this table 
 */
const tags = [
    { photoID: "1", userID: "aaa" },
    { photoID: "2", userID: "bbb" },
    { photoID: "2", userID: "ccc" },
    { photoID: "2", userID: "aaa" },
]
const resolvers = {
    // Query: {
    //     totalPhotos: () => photos.length
    // },
    Query: {
        totalPhotos: (parent, args) => photos.length,
        /*
         * Resolve the after arg 
         */
        allPhotos: (parent, args) => photos.filter(p => new Date(p.created) >= args.after),
        allUsers: () => users
    },
    Mutation: {
        /*
         *  postPhoto is defined under Mutation, so postPhoto is a root resolver
         *  parent is always the first argument of resolver, here parent point to "Mutation"
         */
        postPhoto(parent, args) {
            const newPhoto = {
                id: _id++,
                created: new Date(),
                /*
                 * url field could be assigned value here 
                 */
                // url: `http://mysite/img/${_id}.jpg`,
                ...args.input // now we are using PostPhotoInput input type as the postPhoto argument
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
        url: parent => `http://mysite/img/${parent.id}.jpg`,
        postedBy: parent => users.find(u => u.githubLogin === parent.githubUser),
        taggedUsers: parent => tags.filter(t => t.photoID === parent.id).map(t => users.find(u => u.githubLogin === t.userID))

    },
    User: {
        postedPhotos: parent => photos.filter(p => p.githubUser === parent.githubLogin),
        inPhotos: parent => tags.filter(t => t.userID === parent.githubLogin).map(t => photos.find(p => p.id === t.photoID))
    },
    /*
     * The resolver for customized type 
     */
    DateTime: new GraphQLScalarType({
        name: 'DateTime',
        description: 'A valid date time value',
        parseValue: value => new Date(value),
        serialize: value => new Date(value).toISOString(),
        parseLiteral: ast => ast.value
    })
}

/*
 * Run Apollo Server, the arguments are schema field defination and resolver
 */
const server = new ApolloServer({ typeDefs, resolvers })

server.listen().then(({ url }) => console.log(`GraphQL Service running on ${url}`))