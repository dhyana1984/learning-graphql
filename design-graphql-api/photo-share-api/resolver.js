const { GraphQLScalarType } = require('graphql')


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

const tags = [
    { photoID: "1", userID: "aaa" },
    { photoID: "2", userID: "bbb" },
    { photoID: "2", userID: "ccc" },
    { photoID: "2", userID: "aaa" },
]
/*
 * db is from context object, which was created in ApolloServer constructor 
 */
const resolvers = {
    Query: {
        totalPhotos: (parent, args, { db }) => db.collection('photos').estimatedDocumentCount(),
        totalUsers: (parent, args, { db }) => db.collection('users').estimatedDocumentCount(),
        allPhotos: (parent, args, { db }) => db.collection('photos').find().toArray(),
        allUsers: (parent, args, { db }) => db.collection('users').find().toArray()
    },
    Mutation: {
        postPhoto(parent, args) {
            const newPhoto = {
                id: _id++,
                created: new Date(),
                ...args.input
            }
            photos.push(newPhoto)
            return newPhoto
        }
    },
    Photo: {
        url: parent => `http://mysite/img/${parent.id}.jpg`,
        postedBy: parent => users.find(u => u.githubLogin === parent.githubUser),
        taggedUsers: parent => tags.filter(t => t.photoID === parent.id).map(t => users.find(u => u.githubLogin === t.userID))

    },
    User: {
        postedPhotos: parent => photos.filter(p => p.githubUser === parent.githubLogin),
        inPhotos: parent => tags.filter(t => t.userID === parent.githubLogin).map(t => photos.find(p => p.id === t.photoID))
    },
    DateTime: new GraphQLScalarType({
        name: 'DateTime',
        description: 'A valid date time value',
        parseValue: value => new Date(value),
        serialize: value => new Date(value).toISOString(),
        parseLiteral: ast => ast.value
    })
}

module.exports = resolvers
