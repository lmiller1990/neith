<script lang="ts" setup>
import { useQuery } from "@tanstack/vue-query";
import Card from "../components/Card.vue";
import Button from "../components/Button.vue";
import { trpc } from "../trpc.js";

const orgQuery = useQuery({
  queryKey: ["organization"],
  queryFn: () => trpc.getOrganization.query(),
});
</script>

<template>
  <div>
    <Card class="mb-4">
      <h2>Account Information</h2>
      <p class="my-2">
        Organization: {{ orgQuery.data.value?.organization_name }}
      </p>
      <p class="my-2">
        Account Email: {{ orgQuery.data.value?.organization_email }}
      </p>
      <!-- <p class="my-2">Plan Type: (TODO!!)</p> -->
      <form action="/sign_out" method="POST">
        <button class="border rounded p-1 text-fuchsia-600 border-fuchsia-600">
          Sign Out
        </button>
      </form>
    </Card>
  </div>

  <!-- <div class="flex flex-col md:flex-row">
    <Card class="flex-1 w-full md:w-1/2 mr-2 mb-4 p-6">
      <h1 class="text-center my-2">Free</h1>
      <h2 class="text-center my-8 text-2xl font-semibold text-gray-400">
        US$0/year
      </h2>
      <ul class="mt-2 h-32 list-tick font-sm">
        <li>Up to 5 users</li>
        <li>Monitor 5 packages</li>
        <li>Email Notifications</li>
      </ul>
      <div class="text-center">
        <Button disabled>Your Plan</Button>
      </div>
    </Card>

    <Card class="flex-1 w-full md:w-1/2 mb-4 p-6">
      <h1 class="text-center my-2">Business</h1>
      <h2 class="text-center my-8 text-2xl font-semibold text-gray-400">
        US$19/year
      </h2>
      <ul class="mt-2 h-32 list-tick font-sm">
        <li>Unlimited users</li>
        <li>Unlimited packages</li>
        <li>Email Notifications</li>
        <li>Push Notifications</li>
      </ul>
      <form class="w-100 text-center" action="/get_plan_business" method="POST">
        <Button>Get</Button>
      </form>
    </Card>
  </div> -->
</template>

<style scoped>
.list-tick li::before {
  content: "✅";
  margin-right: 0.25rem;
}
</style>
