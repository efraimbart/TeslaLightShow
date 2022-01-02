const querystring = require('querystring')
const { Router } = require('express')
const axios = require('axios')
const Spotify = require('spotify-web-api-node')
const { domains } = require('../../common/constants')

const router = Router()

router.post('/auth/reddit/access_token', async (req, res) => {
  const body = {
    grant_type: 'authorization_code',
    code: req.body.code,
    redirect_uri: req.body.redirect_uri
  }
  const response = await axios.post(`${domains.reddit}/api/v1/access_token`, querystring.stringify(body), {
    headers: {
      Authorization: `Basic ${Buffer.from(`${req.body.client_id}:${process.env.REDDIT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': process.env.REDDIT_USERAGENT
    }
  })
  res.json(response.data)
})

router.post('/auth/spotify/access_token', async (req, res) => {
  const spotify = new Spotify({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_SECRET
  })

  const data = await spotify.clientCredentialsGrant()
  res.json(data.body)
})

module.exports = router
