<script lang="ts" setup>
import { watchDebounced } from "@vueuse/core";
import { ref } from "vue";
import { notifyWhen } from "../../../shared/constants.js";
import Button from "../../components/Button.vue";
import Input from "../../components/Input.vue";
import PkgInfo from "../../components/PkgInfo.vue";
import { useModal } from "../../composables/modal.js";
import { trpc } from "../../trpc";

export type Pkg = Awaited<ReturnType<typeof trpc["getDependencies"]["query"]>>;

const pkgName = ref("");
const pkg = ref<Pkg>();
const frequency = ref<typeof notifyWhen[number]>("major");
const loading = ref(false);

const modal = useModal();

async function disableWhileRuning(task: () => Promise<void>) {
  loading.value = true;
  await task();
  loading.value = false;
}

async function fetchPackageData(search: string) {
  disableWhileRuning(async () => {
    pkg.value = await trpc.getDependencies.query(search.toLowerCase());
  });
}

watchDebounced(pkgName, fetchPackageData, { debounce: 500 });

async function handleSubmit() {
  await disableWhileRuning(async () => {
    await trpc.savePackage.mutate({
      name: pkgName.value.toLowerCase(),
      frequency: frequency.value,
    });
  });
  modal.hideModal();
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col">
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
