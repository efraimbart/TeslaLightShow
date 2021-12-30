<template>
  <div />
</template>

<script>
export default {
  layout: 'blank',
  created () {
    this.$auth.loginWith('social')
  }
}
</script>
