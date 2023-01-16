<script lang="ts" setup>
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { ref } from "vue";
import Button from "../../components/Button.vue";
import Input from "../../components/Input.vue";
import { useModal } from "../../composables/modal.js";
import { trpc } from "../../trpc";

export type Pkg = Awaited<ReturnType<typeof trpc["getDependencies"]["query"]>>;

const email = ref("");

const modal = useModal();

const queryClient = useQueryClient();

const addEmail = useMutation({
  mutationFn: () => trpc.addEmail.mutate(email.value),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["emails"] });
    modal.hideModal();
  },
});

async function handleSubmit() {
  addEmail.mutate();
}
</script>

<template>
  <form
    @submit.prevent="handleSubmit"
    class="flex flex-col w-full md:w-[600px]"
  >
    <Input
      name="email"
      type="email"
      v-model="email"
      label="Email"
      placeholder=""
    />

    <div class="flex justify-end mt-2">
      <Button :disabled="addEmail.isLoading.value">Submit</Button>
    </div>
  </form>
</template>
