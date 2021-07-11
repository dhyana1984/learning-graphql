const { postPhoto, addFakeUsers, githubAuth, fakeUserAuth } = require('./Mutation')
const { me, totalPhotos, totalUsers, allPhotos, allUsers } = require('./Query')
const { newPhoto, newUser } = require('./Subscription')


/*
 * db is from context object, which was created in ApolloServer constructor 
 */
const resolvers = {
    Query: {
        me,
        totalPhotos,
        totalUsers,
        allPhotos,
        allUsers
    },
    Mutation: {
        postPhoto,
        githubAuth,
        addFakeUsers,
        fakeUserAuth
    },
    Subscription: {
        newPhoto,
        newUser,
    },

}

module.exports = resolvers
