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

    if (!this.$route.query.code) {
      const routeData = this.$router.resolve('/submit')
      window.opener.postMessage('connectFailed', routeData.href)
      window.close()
    }
  }
}
</script>
