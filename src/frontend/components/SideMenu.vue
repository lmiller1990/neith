<script lang="ts" setup>
const props = defineProps<{
  items: string[];
  selected?: string
}>();
</script>

<template>
  <ul>
    <li
      v-for="item of items"
      :key="item"
      class="my-2 rounded-md p-2 capitalize hover:cursor-pointer hover:bg-gray-200"
      :class="{
        'bg-white': props.selected !== item,
        'bg-gray-200': props.selected === item,
      }"
    >
      {{ item }}
    </li>
  </ul>
</template>
