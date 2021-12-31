<template>
  <div/>
</template>

<script>
export default {
  name: '404Redirect',
  asyncData ({ redirect }) {
    return redirect('/submit')
  }
}
</script>
