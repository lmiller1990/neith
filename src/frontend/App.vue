<script lang="ts" setup>
import { ref } from "vue";
import { trpc } from "./trpc";

let user = ref()

async function fetchUser () {
  const u = await trpc.getUser.query()
  user.value = u
}

fetchUser()
</script>

<template>ok: {{  user  }}</template>
