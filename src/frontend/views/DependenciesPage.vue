<script lang="ts" setup>
import PkgInfo from "../components/PkgInfo.vue";
import Button from "../components/Button.vue";
import { trpc } from "../trpc.js";
import { useModal } from "../composables/modal.js";
import { useQuery } from "@tanstack/vue-query";

export type Modules = Awaited<
  ReturnType<typeof trpc["getOrganizationModules"]["query"]>
>;

const depsQuery = useQuery({
  queryKey: ["dependencies"],
  queryFn: () => trpc.getOrganizationModules.query(),
});

const modal = useModal();
</script>

<template>
  <div>
    <div class="flex justify-end mb-2">
      <Button @click="modal.showModal('dependenciesForm')">Add</Button>
    </div>
    <div
      v-for="pkg of depsQuery.data.value"
      :key="pkg.name"
      class="flex flex-col mb-4"
    >
      <PkgInfo :pkg="pkg" />
    </div>
  </div>
</template>
