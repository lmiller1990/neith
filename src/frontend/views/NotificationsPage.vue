<script lang="ts" setup>
import { ref } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import type { schedule } from "../../../dbschema.js";
import Button from "../components/Button.vue";
import Card from "../components/Card.vue";
import TrashIcon from "../components/TrashIcon.vue";
import { useModal } from "../composables/modal.js";
import { trpc } from "../trpc.js";
import SlackCard from "./NotificationsPage/SlackCard.vue";

const frequency = ref<schedule>("weekly");

const schedules: schedule[] = ["daily", "weekly"];

const modal = useModal();

const queryClient = useQueryClient();

useQuery({
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
  mutationFn: (frequency: schedule) => trpc.saveFrequency.mutate(frequency),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["frequency"] });
  },
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

    <form
      class="flex flex-col"
      @submit.prevent="updateFrequency.mutate(frequency)"
    >
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
        <Button :disabled="updateFrequency.isLoading.value">Save</Button>
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

  <SlackCard />
</template>
