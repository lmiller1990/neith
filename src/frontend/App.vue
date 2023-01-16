<script lang="ts" setup>
import { useRoute } from "vue-router";
import SideMenu, { MenuLink } from "./components/SideMenu.vue";
import { useModal } from "./composables/modal.js";

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

const modal = useModal();

function handleHideModal(event: Event) {
  if ((event.target as HTMLDivElement).id !== "modal") {
    return;
  }
  modal.hideModal();
}

const route = useRoute();
</script>

<template>
  <div
    v-show="modal.show.value"
    id="modal"
    class="fixed w-screen h-screen z-10 flex justify-center flex-col items-center bg-gray-400/50"
    @click="handleHideModal"
  >
    <component
      :is="modal.component.value"
      class="pt-8 px-8 pb-4 rounded bg-white shadow-xl"
    />
  </div>

  <div class="flex items-center flex-col p-4 md:p-0">
    <h1 class="uppercase mb-6 mt-2 md:my-8 text-5xl text-fuchsia-600">
      <RouterLink to="/">Neith</RouterLink>
    </h1>
    <div class="md:flex justify-center w-full">
      <div class="w-full md:w-52 md:mr-4">
        <SideMenu :items="items" :selected="route.name?.toString()" />
      </div>
      <div class="md:w-[32rem]">
        <RouterView />
      </div>
    </div>
  </div>
</template>
