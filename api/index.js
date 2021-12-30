const express = require('express')
const Snoowrap = require('snoowrap')
const multer = require('multer')
const validator = require('validator')
const { urlValidatorOptions, sites } = require('../common/constants')

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

app.use(auth)

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

      const validation = validate(req.files, req.body)
      if (!validation.success) {
        res.json(validation)
        return
      }

      const sitesResponse = await submitToSites(req.files, req.body)
      if (!sitesResponse.success) {
        res.json(sitesResponse)
        return
      }

      const redditResponse = await submitToReddit(req.body, sitesResponse, authorization)
      if (!redditResponse.success) {
        res.json(redditResponse)
        return
      }

      res.json({
        success: true,
        sites: sitesResponse.sites,
        redditUrl: redditResponse.redditUrl
      })
    } catch (e) {
      res.json({
        success: false,
        error: 'Something went wrong, please try again.'
      })
    }
  }
)

const submitToSites = async (files, model) => {
  // TODO: Validate fseq file before sending to site or site does validation?

  const sitesResponse = {
    success: false,
    error: 'Unable to post to any of the selected sites, please select another site or try again.',
    sites: []
  }

  const submittedSites = model.postInfo.sites.map(siteId => sites.find(site => site.id === JSON.parse(siteId)))
  const postUrls = await Promise.allSettled(submittedSites.map(site => siteMethods[site.name](files, model)))

  for (let i = 0; i < submittedSites.length; i++) {
    const site = submittedSites[i]
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

  return sitesResponse
}

const siteMethods = {
  async 'teslalight.show' (files, model) {
    return 'https://teslalight.show/'
  },
  async 'teslalightshare.io' (files, model) {
    return 'https://teslalightshare.io/'
  },
  async 'tsla.digital' (files, model) {
    return 'https://tsla.digital/'
  },
  async 'console.la' (files, model) {
    return 'https://console.la/'
  }
}

const validate = (files, model) => {
  const validation = { success: true }
  const siteIds = sites.map(site => site.id)

  if (
    !files['files[fseq]'] ||
    !files['files[fseq]'] ||
    !model.song || // TODO: Add nested song validation.
    !model.video ||
    (JSON.parse(model.video.option) === 2 && (!model.video.link || !validator.isURL(model.video.link, urlValidatorOptions))) ||
    !model.postInfo ||
    !model.postInfo.sites ||
    !model.postInfo.sites.length ||
    !model.postInfo.sites.every(siteId => siteIds.includes(JSON.parse(siteId))) ||
    !model.creatorInfo ||
    (model.creatorInfo.tip && !validator.isURL(model.creatorInfo.tip, urlValidatorOptions))
  ) {
    return {
      success: false,
      error: 'Please ensure that all fields are appropriately filled out.'
    }
  }

  return validation
}

const submitToReddit = async ({ song, video, postInfo, creatorInfo }, sitesResponse, authorization) => {
  const submissionRequest = {
    title: `${song.name} - ${song.artist}`,
    url: video.link
  }
  const commentRequest = createCommentRequest(song, creatorInfo, sitesResponse)

  const subreddit = getSubmissionClient(JSON.parse(postInfo.connectedToReddit), authorization)
    .getSubreddit(process.env.SUBREDDIT)

  let submission = JSON.parse(video.option) === 2
    ? await subreddit.submitLink(submissionRequest)
    : await subreddit.submitSelfpost(submissionRequest)

  submission = rBot.getSubmission(submission.name.split('_')[1])

  await submission
    .selectFlair({ flair_template_id: process.env.FLAIR })
    .reply(commentRequest)
    .distinguish({ sticky: true })

  const url = await submission.permalink

  return {
    success: true,
    redditUrl: `https://www.reddit.com${url}`
  }
}

const getSubmissionClient = (connectedToReddit, authorization) => {
  if (connectedToReddit) {
    const accessToken = authorization.split('Bearer ').pop()

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
- Name: ${song.name}
- Artist: ${song.artist}
- Link: ${song.url}

${creatorInfo.credit || creatorInfo.tip ? '### Creator Info:' : ''}
${creatorInfo.credit ? `- Credit: ${creatorInfo.credit}` : ''}
${creatorInfo.tip ? `- Tip link: ${creatorInfo.tip}` : ''}
  `
}

module.exports = app
