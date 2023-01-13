<script lang="ts" setup>
const props = defineProps<{
  name: string;
  label: string;
  modelValue: string;
  placeholder?: string;
  type?: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

function handleChange(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  emit("update:modelValue", value);
}
</script>

<template>
  <div class="flex flex-col">
    <label class="m-1 font-light" :for="props.name">{{ props.label }}</label>
    <input
      :name="props.name"
      :id="props.name"
      :value="props.modelValue"
      :type="props.type ?? 'text'"
      @input="handleChange"
      :placeholder="props.placeholder"
      class="border border-black rounded-md p-1 text-xl"
    />
  </div>
</template>
