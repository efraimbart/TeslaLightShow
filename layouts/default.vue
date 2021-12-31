<template>
  <v-app>
    <v-app-bar
      color="primary"
      height="60"
      fixed
      app
    >
      <v-toolbar-title>
        <a :href="`${redditDomain}/r/TeslaLightShow/`" target="_blank">
          <v-avatar style="margin-right: 10px">
            <v-img src="icon.png" />
          </v-avatar>
        </a>
        <a :href="`${redditDomain}/r/TeslaLightShow/`" target="_blank" style="text-decoration: none; color: whitesmoke">r/TeslaLightShow</a>
      </v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <v-footer>
      <v-col class="text-center">
        <a :href="`${redditDomain}/r/TeslaLightShow/`" target="_blank" style="text-decoration: none;">r/TeslaLightShow</a> • <a :href="`${redditDomain}/u/efraimbart/`" target="_blank" style="text-decoration: none;">/u/efraimbart</a>
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
import { redditDomain } from '@/common/constants'

export default {
  name: 'DefaultLayout',
  data () {
    return {
      redditDomain
    }
  }
}
</script>
