import { DefinePlugin } from 'webpack'

const reddit = (reddit) => {
  const mobileReddit = {
    ...reddit
  }
  mobileReddit.endpoints = { ...reddit.endpoints }
  mobileReddit.endpoints.authorization = reddit.endpoints.mobileAuthorization

  delete reddit.endpoints.mobileAuthorization
  delete mobileReddit.endpoints.mobileAuthorization

  return {
    reddit,
    mobileReddit
  }
}

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - r/TeslaLightShow',
    title: 'r/TeslaLightShow',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'The official submission form of r/TeslaLightShow' },
      { hid: 'name', name: 'name', content: 'r/TeslaLightShow' },
      { hid: 'image', name: 'image', content: '/hero.png' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
    '@nuxtjs/device'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    // https://auth.nuxtjs.org/
    '@nuxtjs/auth-next'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: process.env.BASE_URL || 'http://localhost:3000/'
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en',
      theme_color: '#43151f'
    }
  },

  // PWA module configuration: https://auth.nuxtjs.org/
  auth: {
    // if this is true it'll redirect to the above home url fetchUser
    watchLoggedIn: false,
    redirect: {
      callback: '/auth',
      home: '/authComplete'
    },
    token: {
      global: false
    },
    strategies: {
      ...reddit({
        scheme: 'oauth2',
        endpoints: {
          authorization: 'https://www.reddit.com/api/v1/authorize',
          mobileAuthorization: 'https://www.reddit.com/api/v1/authorize.compact',
          token: 'auth/reddit/access_token',
          // logout: 'https://www.reddit.com/api/v1/revoke_token',
          userInfo: 'https://oauth.reddit.com/api/v1/me'
        },
        clientId: process.env.REDDIT_CLIENT_ID,
        responseType: 'code',
        grant_type: 'authorization_code',
        accessType: 'offline',
        scope: ['identity', 'submit']
      })
    }
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      // dark: false,
      themes: {
        light: {
          primary: '#43151f'
        }
      }
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extend (config) {
      config.plugins.push(new DefinePlugin({ 'global.GENTLY': false }))
    }
  },

  serverMiddleware: [
    '~/api'
  ],

  ssr: true,

  publicRuntimeConfig: {
    comingSoon: JSON.parse(process.env.COMING_SOON) || false
  }
}
