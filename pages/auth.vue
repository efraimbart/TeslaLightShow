<template>
  <div />
</template>

<script>
export default {
  layout: 'blank',
  mounted () {
    if (!this.$route.query.code) {
      const routeData = this.$router.resolve('/')
      window.opener.postMessage('connectFailed', routeData.href)
      window.close()
    }
  }
}
</script>
