<template>
  <v-app>
    <v-app-bar
      fixed
      app
    >
      <v-toolbar-title>
        <a href="https://www.reddit.com/r/TeslaLightShow/" target="_blank">
          <v-avatar style="margin-right: 10px">
            <v-img src="icon.png" />
          </v-avatar>
        </a>
        <a href="https://www.reddit.com/r/TeslaLightShow/" target="_blank" style="text-decoration: none">r/TeslaLightShow</a> Submission Form
      </v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout'
}
</script>
