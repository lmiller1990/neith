<script lang="ts" setup>
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ref } from "vue";
import Card from "../../components/Card.vue";
import Button from "../../components/Button.vue";
import Input from "../../components/Input.vue";
import { trpc } from "../../trpc.js";

const workspace = ref("");
const channel = ref("");

const slackQuery = useQuery({
  queryKey: ["organization"],
  queryFn: () => trpc.getOrganization.query(),
  onSuccess: (vals) => {
    workspace.value = vals.slack_workspace ?? "";
    channel.value = vals.slack_channel ?? "";
  },
});

const queryClient = useQueryClient();

const organizationMutation = useMutation({
  mutationFn: trpc.updateOrganization.mutate,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["organization"] });
  },
});

function handleUpdateOrg() {
  organizationMutation.mutate({
    slack_channel: channel.value,
    slack_workspace: workspace.value,
  });
}
</script>

<template>
  <Card
    :loading="
      slackQuery.isLoading.value || organizationMutation.isLoading.value
    "
  >
    <h2>Slack Notifications</h2>
    <p class="my-2">Configure Slack Push Notifications.</p>

    <Input v-model="workspace" label="Slack Workspace" name="slack-workspace" />
    <Input v-model="channel" label="Channel" name="channel" />

    <div class="flex justify-end my-2">
      <Button
        @click="handleUpdateOrg"
        :disabled="organizationMutation.isLoading.value"
      >
        Save
      </Button>
    </div>
  </Card>
</template>
