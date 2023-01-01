<script lang="ts" setup>
const props = defineProps<{
  disabled?: boolean;
}>();
</script>

<template>
  <button
    :disabled="props.disabled"
    class="text-white p-2 rounded-md w-24 bg-fuchsia-600 hover:bg-fuchsia-500 focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500"
    :class="{
      'disabled:opacity-50': props.disabled,
      'disabled:cursor-not-allowed': props.disabled,
    }"
  >
    <slot />
  </button>
</template>
