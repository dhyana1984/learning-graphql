const { ObjectID } = require('mongodb')

module.exports = {

    me: (parent, args, context) => {
        return context.currentUser
    },
    totalPhotos: (parent, args, { db }) => db.collection('photos').estimatedDocumentCount(),
    totalUsers: (parent, args, { db }) => db.collection('users').estimatedDocumentCount(),
    allPhotos: (parent, args, { db }) => db.collection('photos').find().toArray(),
    allUsers: (parent, args, { db }) => db.collection('users').find().toArray()

}