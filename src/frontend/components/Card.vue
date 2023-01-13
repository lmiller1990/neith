<script lang="ts" setup>
import Loader from "./Loader.vue";

defineProps<{
  loading?: boolean;
}>();
</script>

<template>
  <div class="rounded-md shadow-md p-2 bg-white relative">
    <div
      v-if="loading"
      class="absolute h-full opacity-80 bg-white w-full inset-0 flex items-center justify-center"
    >
      <Loader />
    </div>
    <slot />
  </div>
</template>
