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
  <Card data-cy="pkg-info">
    <div class="flex justify-between items-center mb-2">
      <h2>{{ pkg.name }}</h2>
      <div class="flex items-center">
        <slot name="info" />
        <slot name="remove" />
      </div>
    </div>
    <p class="text-md">{{ pkg.description }}</p>
    <h3 class="my-1">Tags</h3>
    <ul class="text-sm">
      <li v-for="tag of pkg.tags" :key="tag.name">
        {{ tag.name }} • {{ tag.tag }} • {{ format(tag.published) }}
      </li>
    </ul>
  </Card>
</template>
