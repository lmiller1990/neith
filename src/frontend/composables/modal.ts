import { ref, shallowRef } from "vue";
import DependenciesForm from "../views/DependenciesPage/DependencyForm.vue";

const show = ref(false);
const component = shallowRef();

export function useModal() {
  return {
    show,
    component,
    showModal: async (type: "dependenciesForm") => {
      show.value = true;
      switch (type) {
        case "dependenciesForm":
          return (component.value = DependenciesForm);
        default:
          throw new Error(`Unknown modal ${type}`);
      }
    },
    hideModal: () => {
      show.value = false;
    },
  };
}
