<script lang="ts" setup>
import { ref, watch } from "vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import type { Emails, schedule } from "../../../dbschema.js";
import { useDisableWhileExecuting } from "../composables/loading.js";
import Button from "../components/Button.vue";
import Card from "../components/Card.vue";
import { useModal } from "../composables/modal";
import { trpc } from "../trpc.js";

const frequency = ref<schedule>("weekly");

const schedules: schedule[] = ["daily", "weekly"];

const { loading, disableWhileRunning } = useDisableWhileExecuting();
const modal = useModal();

async function handleSaveFrequency() {
  disableWhileRunning(() => trpc.saveFrequency.mutate(frequency.value));
}

const queryClient = useQueryClient()

const frequencyQuery = useQuery({
  queryKey: ['frequency'],
  queryFn: async () => {
    // TODO: How to use query cache as source of truth for inputs?
    // Does TanStack Query support optimistic mutations?
    const res = await trpc.getNotificationSettings.query()
    frequency.value = res.frequency
    // no-op
    return null
  }
})

const updateFrequency = useMutation({
  mutationFn: trpc.saveFrequency.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['frequency'] })
  }
})

watch(frequency, (newVal) => {
  updateFrequency.mutate(newVal)
})

const emailQuery = useQuery({
  queryKey: ['emails'],
  queryFn: () => trpc.getOrganizationEmails.query()
})

const deleteEmail = useMutation({
  mutationFn: (id: number) => trpc.deleteEmail.mutate(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['emails'] })
  }
})

</script>

<template>
  <Card>
    <h2>Notification Frequency</h2>
    <p>How often would you like to receive notifications?</p>

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

  <Card>
    <h2>Email Notifications</h2>
    <p>Emails that receive notifications.</p>

    <ul>
      <li v-for="email of emailQuery.data.value" :key="email.id">
        <span>
          {{ email.email }}
        </span>
        <button @click="deleteEmail.mutate(email.id)">Delete</button>
      </li>
    </ul>

    <div class="flex justify-end mb-2">
      <Button
        @click="modal.showModal('emailForm')"
        :disabled="deleteEmail.isLoading.value"
      >
        Add
      </Button>
    </div>
  </Card>
</template>
