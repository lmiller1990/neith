<script lang="ts" setup>
import { ref } from "vue";
import PkgInfo from "../components/PkgInfo.vue";
import Button from "../components/Button.vue";
import { trpc } from "../trpc";
import DependencyForm from "./DependenciesPage/DependencyForm.vue";
import { useModal } from "../composables/modal";

export type Modules = Awaited<
  ReturnType<typeof trpc["getOrganizationModules"]["query"]>
>;

const packages = ref<Modules>();

async function fetchDependencies() {
  packages.value = await trpc.getOrganizationModules.query();
}

fetchDependencies();

const modal = useModal();
</script>

<template>
  <div>
    <div class="flex justify-end mb-2">
      <Button @click="modal.showModal('dependenciesForm')">Add</Button>
    </div>
    <div v-for="pkg of packages" :key="pkg.name" class="flex flex-col mb-4">
      <PkgInfo :pkg="pkg" />
    </div>
  </div>
</template>
