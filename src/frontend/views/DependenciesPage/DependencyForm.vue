<script lang="ts" setup>
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { watchDebounced } from "@vueuse/core";
import { ref } from "vue";
import { notifyWhen } from "../../../shared/constants.js";
import Button from "../../components/Button.vue";
import Input from "../../components/Input.vue";
import PkgInfo from "../../components/PkgInfo.vue";
import { useDisableWhileExecuting } from "../../composables/loading.js";
import { useModal } from "../../composables/modal.js";
import { trpc } from "../../trpc.js";

export type Pkg = Awaited<ReturnType<typeof trpc["getDependencies"]["query"]>>;

const { loading, disableWhileRunning } = useDisableWhileExecuting();

const pkgName = ref("");
const pkg = ref<Pkg>();
const frequency = ref<typeof notifyWhen[number]>("major");

const modal = useModal();

async function fetchPackageData(search: string) {
  disableWhileRunning(async () => {
    pkg.value = await trpc.getDependencies.query(search.toLowerCase());
  });
}

watchDebounced(pkgName, fetchPackageData, { debounce: 500 });

const queryClient = useQueryClient();

const savePackageMutation = useMutation({
  mutationFn: () =>
    trpc.savePackage.mutate({
      name: pkgName.value.toLowerCase(),
      frequency: frequency.value,
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["dependencies"] });
    modal.hideModal();
  },
});
</script>

<template>
  <form @submit.prevent="savePackageMutation.mutate()" class="flex flex-col">
    <Input
      name="pkgName"
      v-model="pkgName"
      label="Package Name"
      placeholder="Eg react, vite..."
    />

    <div class="my-2">
      <PkgInfo v-if="pkg" :pkg="pkg" />
    </div>

    <div class="my-2">
      <label class="m-1 font-light" for="frequency">Frequency</label>
      <select
        v-model="frequency"
        id="frequency"
        name="frequency"
        class="w-full border border-black rounded-md p-1 text-xl"
      >
        <option v-for="freq of notifyWhen">
          {{ freq }}
        </option>
      </select>
    </div>

    <div class="flex justify-end">
      <Button :disabled="loading">Submit</Button>
    </div>
  </form>
</template>

<style scoped>
form {
  width: 600px;
}
</style>
