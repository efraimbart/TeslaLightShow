<template>
  <v-list-item-avatar
    tile
  >
    <a
      :href="`${domains.songLink}/${item.track}`"
      target="_blank"
    >
      <v-img
        :src="item.image"
      />
    </a>
  </v-list-item-avatar>
</template>

<script>
import { domains } from '@/common/constants'

export default {
  name: 'SongAvatar',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      domains
    }
  }
}
</script>
