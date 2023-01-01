<script lang="ts" setup>
import type { trpc } from "../trpc.js";
import { DateTime } from "luxon";

defineProps<{
  pkg: Awaited<ReturnType<typeof trpc["getDependencies"]["query"]>>;
}>();

function format(str: string) {
  return DateTime.fromISO(str).toRelative();
}
</script>

<template>
  <div class="rounded-md shadow-md p-2 bg-white">
    <h2 class="font-bold text-xl">{{ pkg.name }}</h2>
    <p class="text-md">{{ pkg.description }}</p>
    <h3 class="font-bold text-md">Tags</h3>
    <ul>
      <li v-for="tag of pkg.tags" :key="tag.name">
        {{ tag.name }} • {{ tag.tag }} • {{ format(tag.published) }}
      </li>
    </ul>
  </div>
</template>
