<script lang="ts" setup>
export interface MenuLink {
  href: string;
  name: string;
}

const props = defineProps<{
  items: MenuLink[];
  selected?: string;
}>();
</script>

<template>
  <ul class="flex md:block md:justify-center justify-between w-full">
    <li
      v-for="item of items"
      :key="item.href"
      class="mb-2 rounded-lg capitalize hover:cursor-pointer hover:bg-gray-200 w-full ml-1 first:ml-0 md:ml-0"
      :data-cy-selected="selected === item.name"
      :class="{
        'bg-white': props.selected !== item.name,
        'bg-gray-200': props.selected === item.name,
      }"
    >
      <RouterLink
        :to="item.href"
        class="h-full w-full flex p-2 flex justify-center md:justify-start"
      >
        {{ item.name }}
      </RouterLink>
    </li>
  </ul>
</template>
