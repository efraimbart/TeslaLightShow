export default {
  methods: {
    checkRedirect () {
      if (!window.opener) {
        this.$router.replace('/submit')
        return true
      }
    }
  }
}
