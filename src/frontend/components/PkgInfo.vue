<script lang="ts" setup>
import type { trpc } from "../trpc.js";
import { DateTime } from "luxon";
import Card from "./Card.vue";

defineProps<{
  pkg: Awaited<ReturnType<typeof trpc["getDependencies"]["query"]>>;
}>();

function format(str: string) {
  return DateTime.fromISO(str).toRelative();
}
</script>

<template>
  <Card>
    <h2>{{ pkg.name }}</h2>
    <p class="text-md">{{ pkg.description }}</p>
    <h3>Tags</h3>
    <ul>
      <li v-for="tag of pkg.tags" :key="tag.name">
        {{ tag.name }} • {{ tag.tag }} • {{ format(tag.published) }}
      </li>
    </ul>
  </Card>
</template>
