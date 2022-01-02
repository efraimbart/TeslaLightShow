<template>
  <div />
</template>

<script>
import authRedirect from '@/mixins/authRedirect'

export default {
  mixins: [authRedirect],
  layout: 'blank',
  mounted () {
    if (this.checkRedirect()) {
      return
    }

    this.$auth.loginWith(this.$device.isMobile ? 'mobileReddit' : 'reddit', {
      params: { duration: this.$route.query.duration }
    })
  }
}
</script>
