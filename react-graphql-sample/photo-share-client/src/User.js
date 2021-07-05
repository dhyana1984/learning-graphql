import { gql } from 'apollo-boost'
import React from 'react'
import { Query, Mutation } from 'react-apollo'
import { ROOT_QUERY } from './App'

const ADD_FAKE_USERS_MUTATION = gql`
    mutation addFakeUsers($count: Int!){
        addFakeUsers(count:$count){
            githubLogin
            name
            avatar
        }
    }
`
const Users = () => (
    /*
     * Query component handles data request, loading status and update UI
     * We can use Query component anywhere in ApolloProvider.
     * Query component has a query prop to receive a GraphQL query AST, then return the result
     * There are some more option for Query component, pollInterval/stopPolling/startPolling/fetchMore
     * pollInterval={2000} will make this page send request to GraphQL every 2 seconds
     */
    <Query
        query={ROOT_QUERY}
    // pollInterval={2000}
    >
        {({ data, loading, refetch }) => (
            loading ? <p>loading users...</p>
                :
                <UserList
                    count={data.totalUsers}
                    users={data.allUsers}
                    refetchUsers={refetch}
                />
        )}
    </Query>)


const UserList = ({ count, users, refetchUsers }) => (
    <div>
        <p>{count} Users</p>
        <button onClick={() => refetchUsers()}>Refetch</button>
        <Mutation
            mutation={ADD_FAKE_USERS_MUTATION}
            variables={{ count: 1 }}
            /*
             *  refetchQueries property could execute the query after mutation sent
             */
            refetchQueries={[{ query: ROOT_QUERY }]}
        >
            {/* 
             * Mutation component will make the mutation as a function in child
             */}
            {addFakeUsers => (
                <button onClick={addFakeUsers}>Add Fake Users</button>
            )}
        </Mutation>
        <ul>
            {
                users.map(user => (
                    <UserListItem
                        key={user.githubLogin}
                        name={user.name}
                        avatar={user.avatar}
                    />
                ))
            }
        </ul>
    </div>
)

const UserListItem = ({ name, avatar }) => (
    <li>
        <img src={avatar} width={48} height={48} alt="" />
        {name}
    </li>
)





export default Users