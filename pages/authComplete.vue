<template>
  <div />
</template>

<script>
export default {
  layout: 'blank',
  mounted () {
    const routeData = this.$router.resolve('/')
    window.opener.postMessage('connectDone', routeData.href)
    window.close()
  }
}
</script>
