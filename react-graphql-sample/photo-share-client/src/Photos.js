import React from 'react'
import { Query } from 'react-apollo'
import { ROOT_QUERY } from './App'

const Photos = () => {
    return <Query query={ROOT_QUERY}>
        {
            ({ loading, data }) => {
                return loading ?
                    <p>loading...</p>
                    :
                    data.allPhotos.map(photo => (
                        <img
                            key={photo.id}
                            src={`http://localhost:4000${photo.url}`}
                            alt={photo.name}
                            width={350}
                        />
                    ))
            }
        }
    </Query>
}

export default Photos