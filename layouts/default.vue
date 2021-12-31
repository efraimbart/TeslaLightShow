<template>
  <v-app>
    <v-app-bar
      color="primary"
      height="60"
      fixed
      app
    >
      <v-toolbar-title>
        <a href="https://www.reddit.com/r/TeslaLightShow/" target="_blank">
          <v-avatar style="margin-right: 10px">
            <v-img src="icon.png" />
          </v-avatar>
        </a>
        <a href="https://www.reddit.com/r/TeslaLightShow/" target="_blank" style="text-decoration: none; color: whitesmoke">r/TeslaLightShow</a>
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
