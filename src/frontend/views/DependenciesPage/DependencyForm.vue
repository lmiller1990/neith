<script lang="ts" setup>
import { watchDebounced } from "@vueuse/core";
import { ref } from "vue";
import { notifyWhen } from "../../../shared/constants.js";
import Button from "../../components/Button.vue";
import Input from "../../components/Input.vue";
import PkgInfo from "../../components/PkgInfo.vue";
import { trpc } from "../../trpc";

export type Pkg = Awaited<ReturnType<typeof trpc["getDependencies"]["query"]>>;

const props = defineProps<{
  pkg: Pkg;
}>();

const emit = defineEmits<{
  (event: "fetchPackage", pkg: Pkg): void;
}>();

const pkgName = ref("vite");
const frequency = ref<typeof notifyWhen[number]>("major");
const loading = ref(false)

async function fetchPackageData(search: string) {
  const result = await trpc.getDependencies.query(search);
  emit("fetchPackage", result);
}

watchDebounced(pkgName, fetchPackageData, { debounce: 1000, immediate: true });

async function handleSubmit() {
  loading.value = true
  await trpc.savePackage.mutate({
    name: pkgName.value,
    frequency: frequency.value,
  });
  loading.value = false
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <Input name="pkgName" v-model="pkgName" label="Package Name" />
    <div class="my-2">
      <PkgInfo v-if="pkg" :pkg="pkg" />
    </div>

    <div class="my-2">
      <select
        v-model="frequency"
        class="w-full border border-black rounded-md p-1 text-xl"
      >
        <option v-for="freq of notifyWhen">
          {{ freq }}
        </option>
      </select>
    </div>
    <div class="flex justify-end" 
    >
      <Button :disabled="loading">Submit</Button>
    </div>
  </form>
</template>
