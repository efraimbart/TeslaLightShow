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

    const routeData = this.$router.resolve('/')
    window.opener.postMessage('connectDone', routeData.href)
    window.close()
  }
}
</script>
