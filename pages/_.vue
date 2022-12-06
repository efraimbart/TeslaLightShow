<template>
  <div/>
</template>

<script>
export default {
  name: 'Four04Redirect',
  asyncData ({ redirect }) {
    return redirect('/submit')
  }
}
</script>
