<template>
  <v-list-item-content>
    <v-list-item-title class="text-wrap">
      {{ item.name }}
    </v-list-item-title>
    <v-list-item-subtitle class="text-wrap">
      {{ item.artist }}
    </v-list-item-subtitle>
  </v-list-item-content>
</template>

<script>
export default {
  name: 'SongContent',
  props: {
    item: {
      type: Object,
      required: true
    }
  }
}
</script>
