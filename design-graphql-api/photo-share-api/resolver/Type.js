const { GraphQLScalarType } = require('graphql')


module.exports = {
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
    }),
    Photo: {
        id: parent => parent.id || parent._id,
        url: parent => `/img/photos/${parent._id}.jpg`,
        postedBy: (parent, args, { db }) => db.collection('users').findOne({ githubLogin: parent.userID }),
        taggedUsers: parent => tags.filter(t => t.photoID === parent.id).map(t => users.find(u => u.githubLogin === t.userID))

    },
}