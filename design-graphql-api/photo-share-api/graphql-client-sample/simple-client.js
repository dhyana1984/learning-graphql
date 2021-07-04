const fetch = require("node-fetch")

const query = `{totalPhotos, totalUsers}`
const url = 'http://localhost:4000/graphql'

const opts = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    },
    body: JSON.stringify({ query })
}

fetch(url, opts)
    .then(res => res.json())
    .then(console.log)
    /*
     * use the response into HTML 
     */
    // .then(({ data }) => `
    // <p>photos: ${data.totalPhotos}</p>
    // <p>users: ${data.totalUsers}</p>`)
    // .then(text => document.body.innerHTML = text)
    .catch(console.error)