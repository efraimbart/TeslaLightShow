<template>
  <v-col>
    <v-row>
      <v-col>
        <h1 style="white-space: nowrap" class="text-center">
          {{ value }}
        </h1>
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col style="white-space: nowrap" class="text-center">
        {{ name }}
      </v-col>
    </v-row>
  </v-col>
</template>

<script>
export default {
  name: 'FseqValidationValue',
  props: {
    value: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  }
}
</script>
