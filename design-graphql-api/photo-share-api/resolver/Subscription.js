/*
 * This is the newPhoto Subscription resolver 
 * pubsub.asyncIterator means subscribe 'photo-added' event
 */
const newPhotoSubscribe = (parent, args, { pubsub }) => pubsub.asyncIterator('photo-added')

const newUserSubscribe = (parent, args, { pubsub }) => pubsub.asyncIterator('user-added')

module.exports = {
    newPhoto: {
        /*
         * Note here, for Subscription type, we should define subscribe function for each field
         */
        subscribe: newPhotoSubscribe
    },
    newUser: {
        subscribe: newUserSubscribe
    }
}