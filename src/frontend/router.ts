import { createRouter as createVueRouter, createWebHistory } from "vue-router";
import DependenciesPage from "./views/DependenciesPage.vue";
import NotificationsPage from "./views/NotificationsPage.vue";
import AccountPage from "./views/AccountPage.vue";

export function createRouter() {
  return createVueRouter({
    history: createWebHistory("/app/"),
    routes: [
      {
        path: "/",
        component: DependenciesPage,
      },
      {
        path: "/notifications",
        component: NotificationsPage,
      },
      {
        path: "/account",
        component: AccountPage,
      },
    ],
  });
}
