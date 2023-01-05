import { ref, shallowRef } from "vue";
import DependenciesForm from "../views/DependenciesPage/DependencyForm.vue";
import EmailForm from "../views/NotificationsPage/EmailForm.vue"

const show = ref(false);
const component = shallowRef();

export function useModal() {
  return {
    show,
    component,
    showModal: async (type: "dependenciesForm" | "emailForm") => {
      show.value = true;
      switch (type) {
        case "dependenciesForm":
          return (component.value = DependenciesForm);
        case "emailForm":
          return (component.value = EmailForm);
        default:
          throw new Error(`Unknown modal ${type}`);
      }
    },
    hideModal: () => {
      show.value = false;
    },
  };
}
