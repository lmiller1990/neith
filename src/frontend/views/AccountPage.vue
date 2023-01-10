<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import Card from "../components/Card.vue";
import { trpc } from "../trpc.js";

const orgQuery = useQuery({
  queryKey: ["organization"],
  queryFn: () => trpc.getOrganization.query(),
});
</script>

<template>
  <Card class="mb-4">
    <h2>Account Information</h2>
    <p class="my-2">
      Organization: {{ orgQuery.data.value?.organization_name }}
    </p>
    <p class="my-2">
      Account Email: {{ orgQuery.data.value?.organization_email }}
    </p>
    <p class="my-2">Plan Type: (TODO!!)</p>
    <form action="/sign_out" method="POST">
      <button class="underline">Sign Out</button>
    </form>
  </Card>
</template>
