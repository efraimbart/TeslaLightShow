<template>
  <v-fade-transition>
    <v-container v-show="isMounted" style="max-width: 500px">
      <v-form
        ref="form"
        :disabled="submitting"
        lazy-validation
        @submit.prevent="submit"
      >
        <v-card-title class="primary--text">
          Song info
        </v-card-title>
        <v-container>
          <v-autocomplete
            v-model="model.song"
            label="Song"
            :search-input.sync="songSearch.term"
            :hide-no-data="!songSearch.term || songSearch.loading"
            :items="songSearch.items"
            :loading="songSearch.loading"
            :rules="[v => !!v || 'Please choose a song.']"
            no-data-text="No songs found"
            clearable
            return-object
            no-filter
            outlined
            @click:clear="songSearch.items = []"
          >
            <template #item="{ item }">
              <v-list-item-avatar>
                <v-img
                  :src="item.image.find(image => image.size === 'small')['#text']"
                />
              </v-list-item-avatar>
              <v-list-item-title>
                {{ item.name }} - {{ item.artist }}
              </v-list-item-title>
            </template>
            <template #selection="{ item }">
              <v-flex>
                <div style="text-overflow: ellipsis">
                  {{ item.name }} - {{ item.artist }}
                </div>
              </v-flex>
            </template>
          </v-autocomplete>
        </v-container>
        <v-divider />
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
            accept="audio/quicktime,audio/*"
            :rules="[v => !!v || 'Please upload an audio file.']"
            outlined
          />
        </v-container>
        <v-divider />
        <v-card-title class="primary--text">
          Demo video
        </v-card-title>
        <v-container>
          <v-radio-group v-model="model.video.option" class="mt-0">
            <v-radio disabled label="Upload video demo (Coming soon)" :value="1" />
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
            <v-radio label="Link to video demo" :value="2" />
            <v-expand-transition>
              <v-text-field
                v-if="model.video.option === 2"
                v-model="model.video.link"
                label="Video demo link"
                hint="Video demo link preferred. If unable, please submit an xLights demo link instead."
                :rules="[
                  v => !!v || 'Please enter a demo link or choose None.',
                  validateUrl
                ]"
                persistent-hint
                outlined
              />
            </v-expand-transition>

            <v-radio label="None" :value="3" />
          </v-radio-group>
          <v-divider />
        </v-container>
        <v-card-title class="primary--text">
          Post info
        </v-card-title>
        <v-container>
          <v-input>
            <template
              v-if="!$auth.loggedIn"
            >
              Connect to Reddit to post with your account
              <v-spacer />
              <v-btn
                class="primary--text"
                :disabled="submitting"
                @click="connectToReddit"
              >
                Connect
              </v-btn>
            </template>
            <template
              v-else
            >
              <div>Posting as <a :href="`${redditDomain}/u/${$auth.user.name}`">/u/{{ $auth.user.name }}</a></div>
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
          <v-select
          <v-select
            v-model="model.postInfo.sites"
            label="Sites"
            hint="Select the sites to post to."
            :items="sites"
            :single-line="!model.postInfo.sites.length"
            :rules="[v => (v && !!v.length) || 'Please select one or more sites to post to.']"
            item-text="name"
            item-value="id"
            multiple
            chips
            deletable-chips
            persistent-hint
            outlined
          />
        </v-container>
        <v-divider />
        <v-card-title class="primary--text">
          Creator info
        </v-card-title>
        <v-container>
          <v-text-field
            v-model="model.creatorInfo.credit"
            :label="`Credit${model.postInfo.connectedToReddit ? ' (Optional)' : ''}`"
            :rules="[v => (!!v && !model.postInfo.connectedToReddit) || 'Credit is required if not connected to Reddit.']"
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
              View your show on:
              <ul>
                <li><a :href="response.redditUrl" target="_blank">Reddit</a></li>
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
                <div>
                  Validator courtesy of <a :href="`${redditDomain}/u/xsorifc28`" target="_blank">/u/xsorifc28</a>
                </div>
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
</template>

<script>
import { serialize } from 'object-to-formdata'
import validator from 'validator'
import { Validator as fseqValidator } from '@xsor/tlsv'
import { urlValidatorOptions, sites, redditDomain } from '@/common/constants'
import fseqValidationValue from '@/fseqValidationValue'

const randomizedSites = sites.sort(() => Math.random() - 0.5)

export default {
  components: {
    fseqValidationValue
  },
  data () {
    return {
      valid: false,
      videoFile: null,
      model: {
        song: null,
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
          connectedToReddit: this.$auth.loggedIn,
          sites: randomizedSites.map(site => site.id)
        },
        creatorInfo: {
          credit: null,
          tip: null
        }
      },
      songSearch: {
        term: null,
        items: [],
        loading: false,
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
      sites: randomizedSites,
      redditDomain,
      isMounted: false
    }
  },
  watch: {
    '$auth.loggedIn' (loggedIn) {
      this.model.creatorInfo.connectedToReddit = loggedIn
    },
    'songSearch.term' (term) {
      clearTimeout(this.debounceTimerId)
      if (!term) {
        this.songSearch.items = []
        return
      }
      this.songSearch.loading = true
      this.debounceTimerId = setTimeout(async () => {
        const results = await this.$axios.$get(`https://ws.audioscrobbler.com/2.0/?method=track.search&track=${term}&api_key=ef3d99800b7c7f33b6853ffb9527b2a3&format=json`)

        this.songSearch.items = results.results.trackmatches.track
        this.songSearch.loading = false
      }, 200)
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
  mounted () {
    this.isMounted = true
  },
  methods: {
    validateUrl (url) {
      return !url || validator.isURL(url, urlValidatorOptions) || 'Please enter a valid URL.'
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

      const routeData = this.$router.resolve('/authStart')
      window.open(routeData.href, 'connect', 'popup,width=1000,height=700')
    },
    disconnectFromReddit () {
      this.$auth.reset()
    },
    upload () {
      const data = new FormData()
      data.append('file', this.videoFile)

      this.$axios.$post('/upload', data)
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
      this.response = await this.$axios.$post('/submit', serialize(this.model))
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
      this.model.postInfo.sites = randomizedSites.map(site => site.id)
      this.model.video.option = 2
    }
  }
}
</script>
