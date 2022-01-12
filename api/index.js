const express = require('express')
const FormData = require('form-data')
const Snoowrap = require('snoowrap')
const multer = require('multer')
const validator = require('validator')
const toArrayBuffer = require('to-arraybuffer')
const qs = require('qs')
const { Validator: fseqValidator } = require('@xsor/tlsv')

const axios = require('axios')
const { urlValidatorOptions, sites, domains } = require('../common/constants')
const { extractTokenFromAuthorization, replaceIndexlessArrays } = require('../common/util')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: process.env.MAX_UPLOAD_SIZE
  }
})

const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const auth = require('./routes/auth')

app.use('/auth', auth)

const rBot = new Snoowrap({
  userAgent: process.env.REDDIT_USERAGENT,
  clientId: process.env.REDDIT_BOT_CLIENT_ID,
  clientSecret: process.env.REDDIT_BOT_SECRET,
  username: process.env.REDDIT_BOT_USERNAME,
  password: process.env.REDDIT_BOT_PASSWORD
})

// TODO: Unsafe to allow files without validation?
app.post('/submit',
  upload.fields([
    { name: 'files[fseq]', maxCount: 1 },
    { name: 'files[audio]', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const authorization = req.header('Authorization')

      const bodyString = replaceIndexlessArrays((qs.stringify(req.body, {
        arrayFormat: 'repeat'
      })))
      const body = qs.parse(bodyString, {
        allowPrototypes: true,
        arrayLimit: 10,
        depth: Infinity
      })

      console.log(req.files, body)

      const validation = validate(req.files, body)
      if (!validation.success) {
        res.json(validation)
        return
      }

      const sitesResponse = await submitToSites(req.files, body)
      if (!sitesResponse.success) {
        res.json(sitesResponse)
        return
      }

      const redditResponse = await submitToReddit(body, sitesResponse, authorization)
      if (!redditResponse.success) {
        res.json(redditResponse)
        return
      }

      const response = {
        success: true,
        sites: sitesResponse.sites,
        redditUrl: redditResponse.redditUrl
      }

      console.log(response)
      res.json(response)
    } catch (e) {
      console.error('Error:', e)
      res.json({
        success: false,
        error: 'Something went wrong, please try again.'
      })
    }
  }
)

const submitToSites = async (files, model) => {
  const sitesResponse = {
    success: false,
    error: 'Unable to post to any of the selected sites, please select another site or try again.',
    sites: []
  }

  const submittedSites = model.postInfo.sites.map(submittedSite => ({
    ...submittedSite,
    ...sites.find(site => site.id === JSON.parse(submittedSite.id))
  }))
  const uploadSites = submittedSites.filter(site => (!site.url || JSON.parse(model.postInfo.option) === 1) && JSON.parse(site.upload) && site.available)
  const urlSites = submittedSites.filter(site => site.url)

  if (JSON.parse(model.postInfo.option) === 1 || JSON.parse(model.postInfo.option) === 3) {
    const postUrls = await Promise.allSettled(uploadSites.map(site => siteMethods[site.name](files, model)))

    for (let i = 0; i < uploadSites.length; i++) {
      const site = uploadSites[i]
      const postUrl = postUrls[i]
      if (postUrl.status === 'fulfilled' && postUrl.value) {
        sitesResponse.success = true
        delete sitesResponse.error
        sitesResponse.sites.push({
          success: true,
          name: site.name,
          postUrl: postUrl.value
        })
      } else {
        sitesResponse.sites.push({
          success: false,
          name: site.name,
          error: 'Error posting to this site.'
        })
      }
    }
  }

  if (JSON.parse(model.postInfo.option) === 2 || JSON.parse(model.postInfo.option) === 3) {
    urlSites.forEach((site) => {
      sitesResponse.success = true
      delete sitesResponse.error
      sitesResponse.sites.push({
        success: true,
        name: site.name,
        postUrl: site.url
      })
    }
    )
  }

  return sitesResponse
}

const siteMethods = {
  async 'teslalight.show' (files, model) {
    return 'https://teslalight.show/'
  },
  async 'teslalightshare.io' (files, model) {
    const formData = new FormData()
    formData.append('fseq_file', files['files[fseq]'][0].buffer, files['files[fseq]'][0].originalname)
    formData.append('sound_file', files['files[audio]'][0].buffer, files['files[audio]'][0].originalname)
    formData.append('show_name', `${model.song.values.name} - ${model.song.values.artist}`)
    formData.append('youtube_link', model.video.link)
    formData.append('created_by', model.creatorInfo.credit || `${domains.reddit}/u/${model.creatorInfo.implicitCredit}`)
    formData.append('paypal_link', model.creatorInfo.tip)

    const response = await axios.post(process.env.TESLALIGHTSHAREIO_ENDPOINT, formData, { maxBodyLength: 100000000, headers: formData.getHeaders() })

    if (!response.data.url) {
      throw new Error(response.data.errors)
    }

    return response.data.url
  },
  async 'tsla.digital' (files, model) {
    const formData = new FormData()
    formData.append('fseq', files['files[fseq]'][0].buffer, files['files[fseq]'][0].originalname)
    formData.append('audio', files['files[audio]'][0].buffer, files['files[audio]'][0].originalname)
    formData.append('song', `${model.song.values.name} - ${model.song.values.artist}`)
    if (JSON.parse(model.video.option) === 2) {
      formData.append('videoType', 'CUSTOM')
      formData.append('videoLink', model.video.link)
    }
    formData.append('credit', model.creatorInfo.credit || `${domains.reddit}/u/${model.creatorInfo.implicitCredit}`)
    formData.append('tip', model.creatorInfo.tip)

    const response = await axios.post(process.env.TSLADIGITAL_ENDPOINT, formData, { maxBodyLength: 100000000, headers: formData.getHeaders() })

    if (response.status !== 200) {
      throw new Error(response.data)
    }

    return response.data
  },
  async 'console.la' (files, model) {
    return 'https://console.la/'
  }
}

const validate = (files, model) => {
  const validation = { success: true }
  const siteIds = sites.map(site => site.id)

  if (
    (
      [1, 3].includes(JSON.parse(model.postInfo.option)) &&
      (
        !files['files[fseq]'] ||
        fseqValidator(toArrayBuffer(files['files[fseq]'][0].buffer)).error ||
        !files['files[audio]']
      )
    ) ||
    !model.song ||
    !model.song.values ||
    !model.song.values.name ||
    !model.song.values.artist ||
    (model.song.values.url && !validator.isURL(model.song.values.url, urlValidatorOptions)) ||
    !model.video ||
    (JSON.parse(model.video.option) === 2 && (!model.video.link || !validator.isURL(model.video.link, urlValidatorOptions))) ||
    !model.postInfo ||
    !model.postInfo.sites ||
    !model.postInfo.sites.length ||
    !model.postInfo.sites.some(site =>
      ([1, 3].includes(JSON.parse(model.postInfo.option)) && JSON.parse(site.upload)) ||
      ([2, 3].includes(JSON.parse(model.postInfo.option)) && site.url)) ||
    !model.postInfo.sites.every(site => siteIds.includes(JSON.parse(site.id))) ||
    !model.creatorInfo ||
    !(model.creatorInfo.credit || model.creatorInfo.implicitCredit) ||
    (model.creatorInfo.tip && !validator.isURL(model.creatorInfo.tip, urlValidatorOptions))
  ) {
    console.warn('Failed validation')
    return {
      success: false,
      error: 'Please ensure that all fields are appropriately filled out.'
    }
  }

  return validation
}

const submitToRedditInner = async (connectedToReddit, authorization, video, submissionRequest) => {
  const subreddit = getSubmissionClient(connectedToReddit, authorization)
    .getSubreddit(process.env.SUBREDDIT)

  try {
    return JSON.parse(video.option) === 2
      ? await subreddit.submitLink(submissionRequest)
      : await subreddit.submitSelfpost(submissionRequest)
  } catch (e) {
    if (connectedToReddit) {
      console.error('Trying again as disconnected:', e)
      return await submitToRedditInner(false, undefined, video, submissionRequest)
    } else {
      throw e
    }
  }
}

const submitToReddit = async ({ song, video, postInfo, creatorInfo }, sitesResponse, authorization) => {
  const submissionRequest = {
    title: `${song.values.name} - ${song.values.artist}`,
    url: video.link,
    flair_id: process.env.TEMP_FLAIR
  }
  const commentRequest = createCommentRequest(song, creatorInfo, sitesResponse)
  let submission = await submitToRedditInner(JSON.parse(postInfo.connectedToReddit), authorization, video, submissionRequest)

  submission = rBot.getSubmission(submission.name.split('_')[1])

  await submission
    .selectFlair({ flair_template_id: process.env.FLAIR })
    .reply(commentRequest)
    .distinguish({ sticky: true })

  const url = await submission.permalink

  return {
    success: true,
    redditUrl: `${domains.reddit}${url}`
  }
}

const getSubmissionClient = (connectedToReddit, authorization) => {
  if (connectedToReddit && authorization) {
    const accessToken = extractTokenFromAuthorization(authorization)

    return new Snoowrap({
      userAgent: process.env.REDDIT_USERAGENT,
      accessToken
    })
  } else {
    return rBot
  }
}

const createCommentRequest = (song, creatorInfo, sitesResponse) => {
  return `
### Downloads:
${sitesResponse.sites
    .filter(response => response.success)
    .map(response => `- [${response.name}](${response.postUrl})`)
    .join(
`
`
    )}

### Song Info:
- Name: ${song.values.name}
- Artist: ${song.values.artist}${
    song.values.track || song.values.url
      ? `
- Link: ${song.values.track ? `${domains.songLink}/${song.values.track}` : song.values.url}`
      : ''}

${creatorInfo.credit || creatorInfo.tip ? '### Creator Info:' : ''}
${creatorInfo.credit ? `- Credit: ${creatorInfo.credit}` : ''}
${creatorInfo.tip ? `- Tip link: ${creatorInfo.tip}` : ''}${
    creatorInfo.comments
      ? `

### Comments:
${creatorInfo.comments}
`
      : ''}
`
}

module.exports = app
