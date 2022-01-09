<template>
  <v-select
    v-model="postInfoSites"
    label="Upload to sites"
    :items="sites"
    :single-line="!postInfoSites.length"
    :rules="[v => (v && !!v.length) || `Please select one or more sites to post to${ allowUrl ? ', or enter one or more site post urls' : `, or ${!isAdvanced ? 'toggle the advanced form to ' : '' }link to already created posts` }.`]"
    :item-text="site => `${site.name}${!site.available && !model.postInfo.sites.find(modelSite => modelSite.id === site.id).url ? ' (Coming soon)' : ''}`"
    :item-disabled="site => !site.available || (allowUrl && !!model.postInfo.sites.find(modelSite => modelSite.id === site.id).url)"
    item-value="id"
    multiple
    chips
    deletable-chips
    persistent-hint
    outlined
  />
</template>
<script>
export default {
  name: 'UploadToSites',
  props: {
    allowUrl: {
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
    },
    isAdvanced: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    postInfoSites: {
      get () {
        return this.model.postInfo.sites.filter(site => site.upload || (this.allowUrl && site.url)).map(site => site.id)
      },
      set (siteIds) {
        this.model.postInfo.sites.forEach((site) => { site.upload = siteIds.includes(site.id) })
      }
    }
  }
}
</script>
