<script lang="ts" setup>
import { watchDebounced } from "@vueuse/core";
import { ref } from "vue";
import { notifyWhen } from "../../shared/constants.js";
import PkgInfo from "../components/PkgInfo.vue";
import { trpc } from "../trpc";

const pkgName = ref("vite");
const pkg = ref<Awaited<ReturnType<typeof trpc["getDependencies"]["query"]>>>();
const frequency = ref<typeof notifyWhen[number]>("major");

async function fetchPackageData(search: string) {
  const result = await trpc.getDependencies.query(search);
  pkg.value = result;
}

watchDebounced(pkgName, fetchPackageData, { debounce: 1000, immediate: true });
</script>

<template>
  <form>
    <label for="pkgName">Package Name</label>
    <input name="pkgName" id="pkgName" v-model="pkgName" />
    <select v-model="frequency">
      <option v-for="freq of notifyWhen">
        {{ freq }}
      </option>
    </select>
  </form>

  <PkgInfo v-if="pkg" :pkg="pkg" />
</template>
