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
        name: "dependencies",
        component: DependenciesPage,
      },
      {
        path: "/notifications",
        name: "notifications",
        component: NotificationsPage,
      },
      {
        path: "/account",
        name: "account",
        component: AccountPage,
      },
    ],
  });
}
