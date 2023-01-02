import { ref } from "vue";

export function useDisableWhileExecuting() {
  const loading = ref(false);

  async function disableWhileRunning(task: () => Promise<void>) {
    loading.value = true;
    await task();
    loading.value = false;
  }

  return {
    disableWhileRunning,
    loading,
  };
}
