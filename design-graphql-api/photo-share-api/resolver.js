const { GraphQLScalarType } = require('graphql')
const { authorizeWithGithub } = require('./lib')
const fetch = require('node-fetch')

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

const githubAuth = async (parent, { code }, { db }) => {
    const credentials = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code
    }
    let { message, access_token, avatar_url, login, name } = await authorizeWithGithub(credentials)
    if (message) {
        throw new Error(message)
    }
    let latestUserInfo = {
        name,
        githubLogin: login,
        githubToken: access_token,
        avatar: avatar_url
    }
    const { ops: [user] } = await db
        .collection('users')
        .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true })
    return { user, token: access_token }
}

const postPhoto = async (parent, args, { db, currentUser }) => {
    /*
     * Verify if user authorized via github 
     * Please note when execute query, we must add "Authorization : <token>" in the header
     */
    if (!currentUser) throw Error('only an authrized user can post photo')
    const newPhoto = {
        ...args.input,
        userID: currentUser.githubLogin,
        created: new Date(),
    }
    /*
     * Save the photo into MongoDB and return id 
     */
    const { insertedIds } = await db.collection('photos').insert(newPhoto)
    newPhoto.id = insertedIds[0]
    return newPhoto
}

/*
 * The resolver for addFakeUsers. randomUserApi is a API which can return some fake user data
 */
const addFakeUsers = async (root, { count }, { db }) => {
    const randomUserApi = `https://randomuser.me/api?results=${count}`
    const { results } = await fetch(randomUserApi).then(res => res.json())

    const users = results.map(r => ({
        githubLogin: r.login.username,
        name: `${r.name.first} ${r.name.last}`,
        avatar: r.picture.thumbnail,
        githubToken: r.login.sha1
    }))
    /*
     * Save the fake users to MongoDB 
     */
    await db.collection('users').insert(users)
    return users
}

/*
 *  The resolver for fakeUserAuth
 */
const fakeUserAuth = async (parent, { githubLogin }, { db }) => {
    const user = await db.collection('users').findOne({ githubLogin })
    if (!user) throw Error(`Cannot find user with githubLogin "${githubLogin}"`)
    return {
        token: user.githubToken,
        user
    }
}

/*
 * db is from context object, which was created in ApolloServer constructor 
 */
const resolvers = {
    Query: {
        me: (parent, args, context) => {
            console.log(context)
            return context.currentUser
        },
        totalPhotos: (parent, args, { db }) => db.collection('photos').estimatedDocumentCount(),
        totalUsers: (parent, args, { db }) => db.collection('users').estimatedDocumentCount(),
        allPhotos: (parent, args, { db }) => db.collection('photos').find().toArray(),
        allUsers: (parent, args, { db }) => db.collection('users').find().toArray()
    },
    Mutation: {
        postPhoto,
        githubAuth,
        addFakeUsers,
        fakeUserAuth
    },
    Photo: {
        id: parent => parent.id || parent._id,
        url: parent => `/img/photos/${parent._id}.jpg`,
        postedBy: (parent, args, { db }) => db.collection('users').findOne({ githubLogin: parent.userID }),
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
