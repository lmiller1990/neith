<script lang="ts" setup>
import { ref } from "vue";
import SideMenu, { MenuLink } from "./components/SideMenu.vue";
import { trpc } from "./trpc";

let user = ref();

async function fetchUser() {
  const u = await trpc.getDependencies.query();
  user.value = u;
}

fetchUser();

const items: MenuLink[] = [
  {
    href: "/",
    name: "dependencies",
  },
  {
    href: "/notifications",
    name: "notifications",
  },
  {
    href: "/account",
    name: "account",
  },
];
</script>

<template>
  <SideMenu :items="items" selected="dependencies" />
  <RouterView />
</template>
