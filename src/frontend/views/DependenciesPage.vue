<script lang="ts" setup>
import { ref } from "vue";
import PkgInfo from "../components/PkgInfo.vue";
import DependencyForm, { Pkg } from "./DependenciesPage/DependencyForm.vue";

const pkg = ref<Pkg>();

function setPkg(p: Pkg) {
  pkg.value = p;
}
</script>

<template>
  <PkgInfo v-if="pkg" :pkg="pkg" />
  <DependencyForm @fetch-package="setPkg" />
</template>
