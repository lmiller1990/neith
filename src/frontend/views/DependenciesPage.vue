<script lang="ts" setup>
import PkgInfo from "../components/PkgInfo.vue";
import Button from "../components/Button.vue";
import { trpc } from "../trpc.js";
import { useModal } from "../composables/modal.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import TrashIcon from "../components/TrashIcon.vue";

export type Modules = Awaited<
  ReturnType<typeof trpc["getOrganizationModules"]["query"]>
>;

const depsQuery = useQuery({
  queryKey: ["dependencies"],
  queryFn: () => trpc.getOrganizationModules.query(),
});

const queryClient = useQueryClient();

const deleteDependency = useMutation({
  mutationFn: trpc.deleteDependency.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["dependencies"] });
  },
});

const modal = useModal();
</script>

<template>
  <div>
    <div class="flex justify-end mb-2">
      <Button @click="modal.showModal('dependenciesForm')">Add</Button>
    </div>
    <template v-if="depsQuery.data.value?.length">
      <div
        v-for="pkg of depsQuery.data.value"
        :key="pkg.name"
        class="flex flex-col mb-4"
      >
        <PkgInfo :pkg="pkg">
          <template #info>
            <span class="mr-2 text-gray-500 text-sm">
              {{ pkg.notifyWhen }}
            </span>
          </template>

          <template #remove>
            <button class="h-5 w-5" @click="deleteDependency.mutate(pkg.name)">
              <TrashIcon class="fill-red-600 hover:fill-red-400" />
            </button>
          </template>
        </PkgInfo>
      </div>
    </template>

    <template v-else>
      <div class="text-center my-8">
        <p class="py-1">You aren't currently tracking and dependencies.</p>
        <p>
          Click
          <a
            @click="modal.showModal('dependenciesForm')"
            class="underline cursor-pointer"
            >here</a
          >
          to add one.
        </p>
      </div>
    </template>
  </div>
</template>
