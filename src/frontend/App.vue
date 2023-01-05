<script lang="ts" setup>
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
</script>

<template>
  <div
    v-show="modal.show.value"
    id="modal"
    class="absolute w-screen h-screen z-10 flex justify-center flex-col items-center bg-gray-400/50"
    @click="handleHideModal"
  >
    <component
      :is="modal.component.value"
      class="pt-8 px-8 pb-4 rounded bg-white shadow-xl"
    />
  </div>

  <div class="flex items-center flex-col">
    <h1 class="uppercase my-8 text-5xl text-fuchsia-600">Dep Watch</h1>
    <div class="flex justify-center">
      <div class="w-52 mr-4">
        <SideMenu :items="items" selected="dependencies" />
      </div>
      <div class="w-[32rem]">
        <RouterView />
      </div>
    </div>
  </div>
</template>
