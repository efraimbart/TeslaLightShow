﻿const querystring = require('querystring')
const { Router } = require('express')
const axios = require('axios')

const router = Router()

router.post('/auth/access_token', async (req, res) => {
  const body = {
    grant_type: 'authorization_code',
    code: req.body.code,
    redirect_uri: req.body.redirect_uri
  }
  const response = await axios.post('https://www.reddit.com/api/v1/access_token', querystring.stringify(body), {
    headers: {
      Authorization: `Basic ${Buffer.from(`${req.body.client_id}:${process.env.REDDIT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': process.env.REDDIT_USERAGENT
    }
  })
  res.json(response.data)
})

module.exports = router