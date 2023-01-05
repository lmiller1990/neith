<script lang="ts" setup>
import { ref, watch } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import type { Emails, schedule } from "../../../dbschema.js";
import { useDisableWhileExecuting } from "../composables/loading.js";
import Button from "../components/Button.vue";
import Card from "../components/Card.vue";
import TrashIcon from "../components/TrashIcon.vue";
import { useModal } from "../composables/modal";
import { trpc } from "../trpc.js";

const frequency = ref<schedule>("weekly");

const schedules: schedule[] = ["daily", "weekly"];

const { loading, disableWhileRunning } = useDisableWhileExecuting();
const modal = useModal();

async function handleSaveFrequency() {
  disableWhileRunning(() => trpc.saveFrequency.mutate(frequency.value));
}

const queryClient = useQueryClient();

const frequencyQuery = useQuery({
  queryKey: ["frequency"],
  queryFn: async () => {
    // TODO: How to use query cache as source of truth for inputs?
    // Does TanStack Query support optimistic mutations?
    const res = await trpc.getNotificationSettings.query();
    frequency.value = res.frequency;
    // no-op
    return null;
  },
});

const updateFrequency = useMutation({
  mutationFn: trpc.saveFrequency.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["frequency"] });
  },
});

watch(frequency, (newVal) => {
  updateFrequency.mutate(newVal);
});

const emailQuery = useQuery({
  queryKey: ["emails"],
  queryFn: () => trpc.getOrganizationEmails.query(),
});

const deleteEmail = useMutation({
  mutationFn: (id: number) => trpc.deleteEmail.mutate(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["emails"] });
  },
});
</script>

<template>
  <Card class="mb-4">
    <h2>Notification Frequency</h2>
    <p class="my-2">How often would you like to receive notifications?</p>

    <form class="flex flex-col" @submit.prevent="handleSaveFrequency">
      <div class="flex" v-for="schedule of schedules" :key="schedule">
        <input
          class="mr-2"
          type="radio"
          :id="schedule"
          :value="schedule"
          v-model="frequency"
        />
        <label class="capitalize" :for="schedule">{{ schedule }}</label>
      </div>

      <div class="flex justify-end">
        <Button :disabled="loading">Save</Button>
      </div>
    </form>
  </Card>

  <Card class="mb-4">
    <h2>Email Notifications</h2>
    <p class="my-2">Emails that receive notifications.</p>

    <ul>
      <li
        v-for="email of emailQuery.data.value"
        :key="email.id"
        class="flex justify-between mr-32"
      >
        <span class="text-gray-700 ml-2">
          {{ email.email }}
        </span>
        <button class="h-5 w-5" @click="deleteEmail.mutate(email.id)">
          <TrashIcon class="fill-red-600 hover:fill-red-400" />
        </button>
      </li>
    </ul>

    <div class="flex justify-end my-2">
      <Button
        @click="modal.showModal('emailForm')"
        :disabled="deleteEmail.isLoading.value"
      >
        Add
      </Button>
    </div>
  </Card>
</template>
