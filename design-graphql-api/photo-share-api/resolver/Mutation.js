const { authorizeWithGithub, uploadStream } = require('../lib')
const fetch = require('node-fetch')
const path = require('path')
const { ObjectID } = require('mongodb')

const postPhoto = async (parent, args, { db, currentUser, pubsub }) => {
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

    var toPath = path.join(__dirname, '..', 'assets', 'photos', `${newPhoto.id}.jpg`)
    const { stream } = await args.input.file
    await uploadStream(stream, toPath)


    /*
     * pubsub is a subscription event emitter, it can send the parameter to all observer who subscribed the event
     * it's like EventEmitter in nodejs
     * Here every observer who subscribed 'photo-added' will recieve the parameter newPhoto
     */
    pubsub.publish('photo-added', { newPhoto })
    return newPhoto
}

/*
 * The resolver for addFakeUsers. randomUserApi is a API which can return some fake user data
 */
const addFakeUsers = async (root, { count }, { db, pubsub }) => {
    const randomUserApi = `https://randomuser.me/api?results=${count}`
    const { results } = await fetch(randomUserApi).then(res => res.json())

    /*
     * Because here users don't have id, so we cannot pubsub.publish here 
     */
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

    /*
     * Now new users have id, we publish the new users 
     */
    const newUsers = await db.collection('users')
        .find()
        .sort({ _id: -1 })
        .limit(count)
        .toArray()
    newUsers.forEach(newUser => pubsub.publish('user-added', { newUser }))

    return users
}


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

module.exports = {
    postPhoto,
    addFakeUsers,
    githubAuth,
    fakeUserAuth
}
