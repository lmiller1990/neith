<script lang="ts" setup>
import { ref } from "vue";
import type { schedule } from "../../../dbschema.js";
import { useDisableWhileExecuting } from "../composables/loading.js";
import Button from "../components/Button.vue";
import Card from "../components/Card.vue";
import { trpc } from "../trpc.js";

const frequency = ref<schedule>("weekly");

const schedules: schedule[] = ["daily", "weekly"];

const { loading, disableWhileRunning } = useDisableWhileExecuting();

async function handleSaveFrequency() {
  disableWhileRunning(() => trpc.saveFrequency.mutate(frequency.value));
}
</script>

<template>
  <Card>
    <h2>Notification Frequency</h2>
    <p>How often would you like to receiving notifications?</p>

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
</template>
