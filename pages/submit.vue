<template>
  <div>
  <v-container
    v-if="$nuxt.$config.comingSoon"
    fill-height
    fluid
  >
    <v-row
      align="center"
      justify="center"
    >
      <h1 class="primary--text">
        Coming Soon!
      </h1>
    </v-row>
  </v-container>
  <v-fade-transition v-else>
    <v-container v-show="isMounted" style="max-width: 500px">
      <v-form
        ref="form"
        :disabled="submitting"
        lazy-validation
        @submit.prevent="submit"
      >
        <v-card-title class="primary--text">
          Song
          <v-spacer />
          <v-btn
            width="230"
            :color="isAdvanced ? 'primary' : ''"
            :class="{'primary--text': !isAdvanced}"
            :disabled="submitting"
            @click="toggleAdvanced"
          >
            Toggle {{ isAdvanced ? 'Simple' : 'Advanced' }} Form
          </v-btn>
        </v-card-title>
        <v-container>
          <v-radio-group v-model="model.song.option" class="mt-0" hide-details>
            <v-expand-transition>
              <v-radio
                v-show="isAdvanced"
                label="Search"
                :value="1"
              />
            </v-expand-transition>
            <v-expand-transition>
              <v-autocomplete
                v-if="model.song.option === 1"
                ref="autocomplete"
                v-model="model.song.values"
                label="Search for a song"
                no-data-text="No songs found"
                item-value="track"
                :search-input.sync="songSearchTerm"
                :hide-no-data="!songSearch.term || !songSearch.term.trim() || songSearch.loading"
                :items="songSearch.items"
                :loading="songSearch.loading"
                :rules="[v => !!v || `Please choose a song, or ${!isAdvanced ? 'toggle the advanced form to ' : '' }enter one manually.`]"
                :allow-overflow="false"
                :disabled="submitting"
                clearable
                return-object
                no-filter
                outlined
                @change="$refs.autocomplete.blur()"
                @click:clear="songSearchClear"
                @focus="songSearchFocus"
                @blur="songSearchBlur"
              >
                <template #item="{ item }">
                  <song-avatar :item="item" />
                  <song-content :item="item" />
                </template>
                <template #selection="{ item }">
                  <v-list-item v-show="!songSearch.focused">
                    <song-avatar :item="item" />
                    <song-content :item="item" />
                  </v-list-item>
                </template>
              </v-autocomplete>
            </v-expand-transition>
            <v-expand-transition>
              <v-radio
                v-show="isAdvanced"
                label="Enter manually"
                :value="2"
              />
            </v-expand-transition>
            <v-expand-transition>
              <template v-if="model.song.option === 2">
                <div>
                  <v-row>
                    <v-col>
                      <v-text-field
                        v-model="model.song.values.name"
                        label="Name"
                        :rules="[v => !!v || 'Please enter a song name.']"
                        outlined
                      />
                    </v-col>
                    <v-col>
                      <v-text-field
                        v-model="model.song.values.artist"
                        label="Artist"
                        :rules="[v => !!v || 'Please enter an artist.']"
                        outlined
                      />
                    </v-col>
                  </v-row>
                  <v-text-field
                    v-model="model.song.values.url"
                    label="Link (Optional)"
                    :rules="[validateUrl]"
                    outlined
                  />
                </div>
              </template>
            </v-expand-transition>
          </v-radio-group>
        </v-container>
        <v-divider />
        <v-card-title class="primary--text">
          Video Demo
        </v-card-title>
        <v-container>
          <v-radio-group v-model="model.video.option" class="mt-0" hide-details>
            <v-expand-transition>
              <v-radio v-show="isAdvanced" disabled label="Upload video demo (Coming soon)" :value="1" />
            </v-expand-transition>
            <v-expand-transition>
              <v-file-input
                v-if="model.video.option === 1"
                v-model="videoFile"
                label="Video demo"
                hint="Video demo preferred. If unable, please submit an xLights demo instead."
                accept="video/quicktime,video/*"
                persistent-hint
                outlined
              />
            </v-expand-transition>
            <v-expand-transition>
              <v-radio v-show="isAdvanced" label="Link to video demo" :value="2" />
            </v-expand-transition>
            <v-expand-transition>
              <v-text-field
                v-if="model.video.option === 2"
                v-model="model.video.link"
                label="Video demo link"
                hint="Video demo link preferred. If unable, please submit an xLights demo link instead."
                :rules="[
                  v => !!v || `Please enter a demo link, or ${!isAdvanced ? 'toggle the advanced form and ' : ''}choose &quot;None&quot;.`,
                  validateUrl
                ]"
                persistent-hint
                outlined
              />
            </v-expand-transition>
            <v-expand-transition>
              <v-radio v-show="isAdvanced" label="None" :value="3" />
            </v-expand-transition>
          </v-radio-group>
        </v-container>
        <v-divider />
        <v-card-title class="primary--text">
          Post
        </v-card-title>
        <v-container>
          <v-input>
            <template
              v-if="!$auth.loggedIn"
            >
              <template class="d-flex">
                <div class="mr-5">
                  Connect to Reddit to post with your account
                </div>
                <v-checkbox
                  v-model="model.postInfo.rememberMe"
                  label="Remember me?"
                  class="mt-0 mr-5"
                  :persistent-hint="false"
                  hide-details
                />
                <v-spacer />
                <v-btn
                  class="primary--text"
                  :disabled="submitting"
                  @click="connectToReddit"
                >
                  Connect
                </v-btn>
              </template>
            </template>
            <template
              v-else
            >
              <div>Posting as <a :href="`${domains.reddit}/u/${$auth.user.name}`">/u/{{ $auth.user.name }}</a></div>
              <v-spacer />
              <v-btn
                class="primary--text"
                :disabled="submitting"
                @click="disconnectFromReddit"
              >
                Disconnect
              </v-btn>
            </template>
          </v-input>
          <v-radio-group v-model="model.postInfo.option" class="mt-0" hide-details>
            <v-expand-transition>
              <v-radio
                v-show="isAdvanced"
                label="Upload files and post to external sites"
                :value="1"
              />
            </v-expand-transition>
            <v-expand-transition>
              <upload-to-sites v-if="model.postInfo.option === 1" :model="model" :sites="sites" :is-advanced="isAdvanced" />
            </v-expand-transition>
            <v-expand-transition>
              <v-radio
                v-show="isAdvanced"
                label="Link to already created posts on external sites"
                :value="2"
              />
            </v-expand-transition>
            <v-expand-transition>
              <link-to-sites v-if="model.postInfo.option === 2" :model="model" :sites="sites" />
            </v-expand-transition>
            <v-expand-transition>
              <v-radio
                v-show="isAdvanced"
                label="Upload files and link to already created posts"
                :value="3"
              />
            </v-expand-transition>
            <v-expand-transition>
              <div v-if="model.postInfo.option === 3">
                <upload-to-sites :model="model" :sites="sites" :is-advanced="isAdvanced" allow-url />
                <link-to-sites :model="model" :sites="sites" allow-uploads />
              </div>
            </v-expand-transition>
          </v-radio-group>
        </v-container>
        <v-divider />
        <v-expand-transition>
          <div v-if="model.postInfo.option === 1 || model.postInfo.option === 3">
            <v-card-title class="primary--text">
              Files
            </v-card-title>
            <v-container>
              <v-file-input
                ref="fseq"
                v-model="model.files.fseq"
                label="FSEQ file"
                accept=".fseq"
                :loading="fseq.loading"
                :hint="fseq.loading ? 'Analyzing...' : ''"
                :persistent-hint="fseq.loading"
                :rules="[
                  v => !!v || 'Please upload an FSEQ file.',
                  !(fseq.validation && fseq.validation.error) || fseq.validation.error
                ]"
                outlined
              />
              <v-file-input
                v-model="model.files.audio"
                label="Audio file"
                accept="audio/x-wav,audio/mpeg"
                :rules="[v => !!v || 'Please upload an audio file.']"
                outlined
              />
            </v-container>
            <v-divider />
          </div>
        </v-expand-transition>
        <v-card-title class="primary--text">
          Creator
        </v-card-title>
        <v-container>
          <v-text-field
            ref="credit"
            v-model="model.creatorInfo.credit"
            :label="`Credit${model.postInfo.connectedToReddit ? ' (Optional)' : ''}`"
            :rules="[v => (!!v || model.postInfo.connectedToReddit) || 'Credit is required if not connected to Reddit.']"
            hint="Name, username, or link to credit."
            persistent-hint
            outlined
          />
          <v-text-field
            v-model="model.creatorInfo.tip"
            label="Tip link (Optional)"
            hint="Link to a somewhere the creator can be tipped for their effort."
            :rules="[validateUrl]"
            persistent-hint
            outlined
          />
          <v-textarea
            v-model="model.creatorInfo.comments"
            label="Comments (Optional)"
            outlined
          />
        </v-container>
        <v-col class="text-center">
          <v-btn
            width="150"
            color="primary"
            type="submit"
            :loading="submitting"
          >
            Submit
          </v-btn>
        </v-col>
      </v-form>
      <v-dialog
        v-model="dialog"
        max-width="300"
        persistent
      >
        <v-card>
          <template
            v-if="response.success"
          >
            <v-card-title class="primary--text">
              Light Show Submitted!
            </v-card-title>
            <v-card-text>
              View your post on:
              <ul>
                <li><a :href="response.redditUrl" target="_blank">r/TeslaLightShow</a></li>
                <li v-for="siteResponse in response.sites" :key="siteResponse.name">
                  <a v-if="siteResponse.success" :href="siteResponse.postUrl" target="_blank">{{ siteResponse.name }}</a>
                  <template v-else>
                    {{ siteResponse.name }}: {{ siteResponse.error }}
                  </template>
                </li>
              </ul>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                class="primary--text"
                text
                @click="closeSuccessDialog"
              >
                Submit Another
              </v-btn>
            </v-card-actions>
          </template>
          <template
            v-else
          >
            <v-card-title class="primary--text">
              Error
            </v-card-title>
            <v-card-text>
              {{ response.error }}
              <br>
              <br>
              <div>Please contact <a :href="`${domains.reddit}/u/efraimbart/`" target="_blank" style="text-decoration: none;">/u/efraimbart</a> if you continue to receive this error.</div>
              <v-expansion-panels
                v-if="response.errorDetails"
                class="mt-5"
              >
                <v-expansion-panel>
                  <v-expansion-panel-header>
                    Error details
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <div style="max-height: 100px; overflow-y: auto">
                      {{ response.errorDetails }}
                    </div>
                    <br>
                    <v-btn
                      width="100%"
                      class="primary--text"
                      @click="copyErrorDetails"
                    >
                      {{ copyErrorDetailsText }}
                    </v-btn>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                class="primary--text"
                text
                @click="closeErrorDialog"
              >
                Close
              </v-btn>
            </v-card-actions>
          </template>
        </v-card>
      </v-dialog>
      <v-dialog
        v-model="fseq.dialog"
        max-width="400"
      >
        <v-card>
          <template
            v-if="fseq.validation && !fseq.validation.error"
          >
            <v-card-title class="primary--text">
              FSEQ File
            </v-card-title>
            <v-card-text>
              <v-row>
                <fseq-validation-value
                  :value="fseq.validation.frameCount.toString()"
                  name="Frames"
                />
                <fseq-validation-value
                  :value="`${fseq.validation.stepTime} ms`"
                  name="Step Time"
                />
                <fseq-validation-value
                  :value="new Date(fseq.validation.durationSecs * 1000).toISOString().substr(14, 9)"
                  name="Duration"
                />
                <fseq-validation-value
                  :value="`${(Math.round((fseq.validation.memoryUsage * 100) * 100) / 100)}%`"
                  name="Memory Used"
                />
                <fseq-validation-value
                  :value="`${fseq.validation.commandCount} / 681`"
                  name="Commands"
                />
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-row class="ml-1">
                <v-list-item-subtitle>
                  Validator courtesy of <a :href="`${domains.reddit}/u/xsorifc28`" target="_blank">/u/xsorifc28</a>
                </v-list-item-subtitle>
              </v-row>
              <v-spacer />
              <v-btn
                class="primary--text"
                text
                @click="fseq.dialog = false"
              >
                Close
              </v-btn>
            </v-card-actions>
          </template>
          <template
            v-else-if="fseq.validation"
          >
            <v-card-title class="primary--text">
              Invalid FSEQ File
            </v-card-title>
            <v-card-text>
              {{ fseq.validation.error }}
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                class="primary--text"
                text
                @click="fseq.dialog = false"
              >
                Close
              </v-btn>
            </v-card-actions>
          </template>
        </v-card>
      </v-dialog>
    </v-container>
  </v-fade-transition>
  </div>
</template>

<script>
import { serialize } from 'object-to-formdata'
import validator from 'validator'
import { Validator as fseqValidator } from '@xsor/tlsv'
import Spotify from 'spotify-web-api-node'
import { domains, sites, urlValidatorOptions } from '@/common/constants'
import fseqValidationValue from '@/components/FseqValidationValue'
import songAvatar from '@/components/SongAvatar'
import songContent from '@/components/SongContent'
import LinkToSites from '@/components/LinkToSites'
import UploadToSites from '@/components/UploadToSites'

const randomizedSites = sites.sort(() => Math.random() - 0.5)

export default {
  components: {
    UploadToSites,
    LinkToSites,
    fseqValidationValue,
    songAvatar,
    songContent
  },
  data () {
    return {
      valid: false,
      videoFile: null,
      model: {
        song: {
          option: 1,
          values: null
        },
        files: {
          fseq: null,
          audio: null
        },
        video: {
          option: 2,
          file: null,
          link: null
        },
        postInfo: {
          option: 1,
          connectedToReddit: this.$auth.loggedIn,
          rememberMe: false,
          sites: randomizedSites.map(site => ({ id: site.id, url: null, upload: site.available, name: site.name }))
        },
        creatorInfo: {
          credit: null,
          implicitCredit: null,
          tip: null,
          comments: null
        }
      },
      songSearch: {
        term: null,
        items: [],
        loading: false,
        focused: false,
        debounceTimerId: 0
      },
      fseq: {
        dialog: false,
        validation: null,
        loading: false
      },
      submitting: false,
      dialog: false,
      response: {},
      spotifyValue: {
        instance: null,
        accessToken: null
      },
      sites: randomizedSites,
      domains,
      isMounted: false,
      isDirty: false,
      isAdvanced: false,
      copyErrorDetailsText: 'Copy'
    }
  },
  async fetch () {
    await this.fetchSpotifyAccessToken()
  },
  head () {
    return {
      title: 'Submit'
    }
  },
  computed: {
    songSearchTerm: {
      get () {
        return this.songSearch.term
      },
      set (term) {
        this.songSearch.term = term
        clearTimeout(this.songSearch.debounceTimerId)
        if (!term || !term.trim()) {
          this.songSearch.items = []
          return
        }

        this.songSearch.loading = true
        this.songSearch.debounceTimerId = setTimeout(async () => {
          await this.search(term)
          this.songSearch.loading = false
        }, 200)
      }
    },
    spotify () {
      this.ensureSpotifyInstance()
      return this.spotifyValue.instance
    }
  },
  watch: {
    model: {
      handler () {
        this.isDirty = true
      },
      deep: true
    },
    '$auth.loggedIn' (loggedIn) {
      this.model.postInfo.connectedToReddit = loggedIn
      this.$refs.credit.validate()
      if (loggedIn) {
        this.model.creatorInfo.implicitCredit = this.$auth.user.name
      } else {
        this.model.creatorInfo.implicitCredit = null
      }
    },
    'model.song.option' (option, oldOption) {
      if (option !== oldOption) {
        const oldValues = this.model.song.oldValues
        this.model.song.oldValues = this.model.song.values
        if (option === 1) {
          this.model.song.values = /* TODO: Search input is cleared on hide oldValues || */ null
        }
        if (option === 2) {
          this.model.song.values = oldValues || {}
        }
      }
    },
    'model.files.fseq' (file) {
      if (file) {
        const setResults = (validation) => {
          this.fseq.validation = validation
          this.fseq.dialog = true
          this.fseq.loading = false
          this.$refs.fseq.validate()
        }

        this.fseq.loading = true
        const reader = new FileReader()

        reader.onload = (e) => {
          setResults(fseqValidator(e.target.result))
        }

        reader.onerror = (e) => {
          setResults({
            error: `Error reading file: ${e.message}`
          })
        }

        reader.readAsArrayBuffer(file)
      } else {
        this.fseq.validation = null
      }
    }
  },
  beforeDestroy () {
    window.removeEventListener('beforeunload', this.beforeWindowUnload)
  },
  mounted () {
    window.addEventListener('beforeunload', this.beforeWindowUnload)
    this.isMounted = true
  },
  methods: {
    ensureSpotifyInstance () {
      if (!this.spotifyValue.instance) {
        this.spotifyValue.instance = new Spotify({
          accessToken: this.spotifyValue.accessToken
        })
      }
    },
    async fetchSpotifyAccessToken () {
      const response = await this.$axios.$post('/auth/spotify/access_token')
      this.spotifyValue.accessToken = response.access_token
    },
    async resetSpotifyInstance () {
      await this.fetchSpotifyAccessToken()
      this.spotifyValue.instance.setAccessToken(this.spotifyValue.accessToken)
    },
    validateUrl (url) {
      return !url || validator.isURL(url, urlValidatorOptions) || 'Please enter a valid URL.'
    },
    toggleAdvanced () {
      this.model.song.option = 1
      this.model.video.option = 2
      this.model.postInfo.option = 1
      this.isAdvanced = !this.isAdvanced
    },
    async copyErrorDetails () {
      await navigator.clipboard.writeText(this.response.errorDetails)
      this.copyErrorDetailsText = 'Copied!'
      setTimeout(() => {
        this.copyErrorDetailsText = 'Copy'
      }, 10000)
    },
    async search (term) {
      try {
        const results = await this.spotify.searchTracks(term)
        this.songSearch.items = results.body.tracks.items.map(item => ({
          name: item.name,
          artist: item.artists.map(artist => artist.name).join(', '),
          image: item.album.images.reduce((prevImage, currentImage) => prevImage.height > currentImage.height ? currentImage : prevImage).url,
          url: item.external_urls.spotify,
          track: item.uri
        }))
      } catch (e) {
        if (e.statusCode === 401) {
          await this.resetSpotifyInstance()
          await this.search(term)
        }
      }
    },
    songSearchClear () {
      this.songSearch.items = []
      this.songSearch.term = ''
    },
    songSearchFocus () {
      this.songSearch.focused = true
      // Hack to enable the input to keep the text the user entered
      const oldValue = this.songSearch.term
      this.songSearch.term = ''
      this.$nextTick(() => {
        this.songSearch.term = oldValue
      })
    },
    songSearchBlur () {
      this.songSearch.focused = false
    },
    connectToReddit () {
      const me = this
      const message = async function (e) {
        if (e.data === 'connectDone' || e.data === 'connectFailed') {
          window.removeEventListener('message', message)
          if (e.data === 'connectDone') {
            await me.$auth.fetchUserOnce()
          }
        }
      }

      window.addEventListener('message', message)

      const routeData = this.$router.resolve(`/authStart?duration=${this.model.postInfo.rememberMe ? 'permanent' : 'temporary'}`)
      window.open(routeData.href, 'connect', 'popup,width=1000,height=700')
    },
    disconnectFromReddit () {
      this.$axios.$post('/auth/reddit/revoke_token', {
        accessToken: this.$auth.strategy.token.get(),
        refreshToken: this.$auth.strategy.refreshToken.get()
      })
      this.$auth.reset()
      this.$refs.credit.validate()
    },
    upload () {
      const data = new FormData()
      data.append('file', this.videoFile)

      this.$axios.$post('/upload', data)
    },
    beforeWindowUnload (e) {
      if (this.isDirty && !window.confirm('You have unsaved changes that will be lost, are you sure you\'d like to leave?')) {
        e.preventDefault()
        e.returnValue = ''
      }
    },
    async submit () {
      if (!this.$refs.form.validate()) {
        this.$nextTick(() => {
          const el = this.$el.querySelector('.error--text:first-of-type')
          this.$vuetify.goTo(el)
        })

        return
      }
      this.submitting = true
      try {
        this.response = await this.$axios.$post('/submit', serialize(this.model))
      } catch (e) {
        this.response.error = 'Something went wrong, please try again.'
        this.response.errorDetails = e
      }
      this.submitting = false
      this.dialog = true
    },
    closeErrorDialog () {
      this.dialog = false
      this.response = {}
    },
    closeSuccessDialog () {
      this.closeErrorDialog()
      this.$refs.form.reset()
      this.$nextTick(() => {
        this.model.postInfo.sites = randomizedSites.map(site => ({ id: site.id, url: null, upload: site.available, name: site.name }))
        this.model.video.option = 2
        this.model.song.values = null
        this.model.song.oldValues = null
        this.model.song.option = 1
        this.model.postInfo.option = 1
      })
    }
  }
}
</script>
