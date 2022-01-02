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

  const headers = {
    Authorization: `Basic ${Buffer.from(`${req.body.client_id}:${process.env.REDDIT_SECRET}`).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': process.env.REDDIT_USERAGENT
  }

  const response = await axios.post(`${domains.reddit}/api/v1/access_token`, querystring.stringify(body), { headers })
  res.json(response.data)
})

router.post('/auth/reddit/revoke_token', async (req, res) => {
  const headers = {
    Authorization: `Basic ${Buffer.from(`${req.body.client_id}:${process.env.REDDIT_SECRET}`).toString('base64')}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': process.env.REDDIT_USERAGENT
  }

  await axios.post(`${domains.reddit}/api/v1/revoke_token`, querystring.stringify({
    token: req.body.accessToken,
    token_type_hint: 'access_token'
  }), { headers })

  if (req.body.refreshToken) {
    await axios.post(`${domains.reddit}/api/v1/revoke_token`, querystring.stringify({
      token: req.body.refreshToken,
      token_type_hint: 'refresh_token'
    }), { headers })
  }

  res.json({ success: true })
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
