import { Query } from "react-apollo";
import { ROOT_QUERY } from "./App";
import CurrentUser from './CurrentUser'

const Me = ({ logout, requestCode, signingIn }) => (
    <Query
        query={ROOT_QUERY}
        fetchPolicy="cache-only"
    >
        {
            ({ loading, data }) => data?.me ?
                <CurrentUser
                    {...data.me}
                    logout={logout}
                /> :
                loading ?
                    <p>loading...</p> :
                    <button
                        onClick={requestCode}
                        disabled={signingIn}
                    >
                        SignIn with GitHub
                    </button>


        }
    </Query>
)

export default Me