<template>
  <div>
    <v-text-field
      v-for="(site, i) in sites"
      :key="i"
      ref="text"
      v-model="model.postInfo.sites[i].url"
      :label="`${site.name} link`"
      :rules="[
        v => model.postInfo.sites.some(site => (allowUploads && site.upload) || site.url) || `Please ${ allowUploads ? 'select one or more sites to post to, or ' : ''}enter one or more site post urls.`,
        v => !v || (validator.isURL(v, urlValidatorOptions) && v.includes(site.name)) || `Please enter a valid ${site.name} URL`
      ]"
      outlined
    />
  </div>
</template>
<script>
import validator from 'validator'
import { urlValidatorOptions } from '@/common/constants'

export default {
  name: 'LinkToSites',
  props: {
    allowUploads: {
      type: Boolean,
      default: false
    },
    model: {
      type: Object,
      required: true
    },
    sites: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      validator,
      urlValidatorOptions
    }
  },
  watch: {
    'model.postInfo.sites': {
      handler () {
        this.sites.forEach((_, i) => {
          this.$refs.text[i].validate()
        })
      },
      deep: true
    }
  }
}
</script>
