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
  <ul class="w-52">
    <li
      v-for="item of items"
      :key="item.href"
      class="my-2 rounded-lg capitalize hover:cursor-pointer hover:bg-gray-200"
      :class="{
        'bg-white': props.selected !== item.name,
        'bg-gray-200': props.selected === item.name,
      }"
    >
      <RouterLink :to="item.href" class="h-full w-full flex p-2">
        {{ item.name }}
      </RouterLink>
    </li>
  </ul>
</template>
